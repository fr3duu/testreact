import express from 'express'
import cors from 'cors'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const app = express()
const port = process.env.PORT || 3001
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataDir = path.join(__dirname, 'data')
const usersFile = path.join(dataDir, 'users.json')
const recordsFile = path.join(dataDir, 'records.json')
const distDir = path.join(__dirname, 'dist')

const defaultUsers = [
  { id: 'admin-1', username: 'admin', password: 'admin123', role: 'admin' },
  { id: 'user-1', username: 'demo', password: 'demo123', role: 'user' },
]

const defaultRecords = []

async function ensureFile(filePath, fallback) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })

  try {
    await fs.access(filePath)
  } catch {
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2), 'utf8')
  }
}

async function readJson(filePath, fallback) {
  await ensureFile(filePath, fallback)

  const raw = await fs.readFile(filePath, 'utf8')
  if (!raw.trim()) {
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2), 'utf8')
    return fallback
  }

  try {
    return JSON.parse(raw)
  } catch {
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2), 'utf8')
    return fallback
  }
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8')
}

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'API działa' })
})

app.get('/api/users', async (_req, res) => {
  const users = await readJson(usersFile, defaultUsers)
  const publicUsers = users.map(({ password, ...user }) => user)
  res.json({ users: publicUsers })
})

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {}
  const users = await readJson(usersFile, defaultUsers)

  const user = users.find(
    (entry) => entry.username.toLowerCase() === String(username || '').trim().toLowerCase() && entry.password === String(password || ''),
  )

  if (!user) {
    return res.status(401).json({ message: 'Błędny login lub hasło' })
  }

  const { password: _password, ...safeUser } = user
  return res.json({ user: safeUser })
})

app.post('/api/users', async (req, res) => {
  const { username, password, role } = req.body || {}
  const users = await readJson(usersFile, defaultUsers)

  if (!username || !password) {
    return res.status(400).json({ message: 'Nazwa użytkownika i hasło są wymagane' })
  }

  const lowerName = String(username).trim()
  if (!lowerName) {
    return res.status(400).json({ message: 'Nazwa użytkownika jest wymagana' })
  }

  const exists = users.some((user) => user.username.toLowerCase() === lowerName.toLowerCase())
  if (exists) {
    return res.status(409).json({ message: 'Użytkownik już istnieje' })
  }

  const newUser = {
    id: `user-${Date.now()}`,
    username: lowerName,
    password: String(password),
    role: role === 'admin' ? 'admin' : 'user',
  }

  users.push(newUser)
  await writeJson(usersFile, users)

  const { password: _password, ...safeUser } = newUser
  return res.status(201).json({ user: safeUser })
})

app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params
  const { password, role } = req.body || {}
  const users = await readJson(usersFile, defaultUsers)

  const index = users.findIndex((user) => user.id === id)
  if (index === -1) {
    return res.status(404).json({ message: 'Użytkownik nie istnieje' })
  }

  if (password) {
    users[index].password = String(password)
  }

  if (role) {
    users[index].role = role === 'admin' ? 'admin' : 'user'
  }

  await writeJson(usersFile, users)

  const { password: _password, ...safeUser } = users[index]
  return res.json({ user: safeUser })
})

app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params
  const users = await readJson(usersFile, defaultUsers)
  const filtered = users.filter((user) => user.id !== id)

  if (filtered.length === users.length) {
    return res.status(404).json({ message: 'Użytkownik nie istnieje' })
  }

  await writeJson(usersFile, filtered)
  return res.json({ message: 'Użytkownik usunięty' })
})

app.get('/api/records', async (_req, res) => {
  const records = await readJson(recordsFile, defaultRecords)
  const sorted = [...records].sort((a, b) => b.score - a.score).slice(0, 10)
  return res.json({ records: sorted })
})

app.post('/api/records', async (req, res) => {
  const { name, score, date } = req.body || {}

  if (!name || score === undefined) {
    return res.status(400).json({ message: 'Brakuje danych wyniku' })
  }

  const records = await readJson(recordsFile, defaultRecords)
  const nextEntry = {
    id: `record-${Date.now()}`,
    name: String(name),
    score: Number(score),
    date: date || new Date().toISOString(),
  }

  records.push(nextEntry)
  const sortedRecords = [...records]
    .sort((a, b) => Number(b.score) - Number(a.score))
    .slice(0, 10)

  await writeJson(recordsFile, sortedRecords)

  return res.status(201).json({ record: nextEntry, records: sortedRecords })
})

app.use(express.static(distDir))

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next()
  }

  res.sendFile(path.join(distDir, 'index.html'))
})

try {
  await ensureFile(usersFile, defaultUsers)
  await ensureFile(recordsFile, defaultRecords)
  app.listen(port, () => {
    console.log(`Server działa na http://localhost:${port}`)
  })
} catch (error) {
  console.error('Błąd startu serwera:', error)
  process.exit(1)
}
