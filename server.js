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
const groupsFile = path.join(dataDir, 'groups.json')
const quizzesFile = path.join(dataDir, 'quizzes.json')
const distDir = path.join(__dirname, 'dist')

const defaultUsers = [
  { id: 'admin-1', username: 'admin', password: 'admin123', role: 'admin' },
  { id: 'user-1', username: 'demo', password: 'demo123', role: 'user' },
]

const defaultRecords = []
const defaultGroups = []
const defaultQuizzes = []

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

app.get('/api/users/:id/quizzes', async (req, res) => {
  const { id } = req.params
  const groups = await readJson(groupsFile, defaultGroups)
  const quizzes = await readJson(quizzesFile, defaultQuizzes)

  const assignedQuizzes = quizzes.filter((quiz) => {
    const directAssign = Array.isArray(quiz.assignedToUsers) && quiz.assignedToUsers.includes(id)
    const groupAssign = Array.isArray(quiz.assignedToGroups)
      ? quiz.assignedToGroups.some((groupId) => {
          const group = groups.find((entry) => entry.id === groupId)
          return group ? group.memberIds.includes(id) : false
        })
      : false

    return (directAssign || groupAssign) && quiz.enabled !== false
  })

  const safeQuizzes = assignedQuizzes.map((quiz) => ({
    ...quiz,
    completed: Array.isArray(quiz.completedBy) ? quiz.completedBy.includes(id) : false,
    enabled: quiz.enabled !== false,
  }))

  return res.json({ quizzes: safeQuizzes })
})

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {}
  const users = await readJson(usersFile, defaultUsers)

  const user = users.find(
    (entry) =>
      entry.username.toLowerCase() === String(username || '').trim().toLowerCase() &&
      entry.password === String(password || ''),
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

app.get('/api/groups', async (_req, res) => {
  const groups = await readJson(groupsFile, defaultGroups)
  return res.json({ groups })
})

app.post('/api/groups', async (req, res) => {
  const { name } = req.body || {}
  const groups = await readJson(groupsFile, defaultGroups)

  if (!name || !String(name).trim()) {
    return res.status(400).json({ message: 'Nazwa grupy jest wymagana' })
  }

  const group = {
    id: `group-${Date.now()}`,
    name: String(name).trim(),
    memberIds: [],
  }

  groups.push(group)
  await writeJson(groupsFile, groups)
  return res.status(201).json({ group })
})

app.post('/api/groups/:groupId/users', async (req, res) => {
  const { groupId } = req.params
  const { userId } = req.body || {}
  const groups = await readJson(groupsFile, defaultGroups)
  const group = groups.find((entry) => entry.id === groupId)

  if (!group) {
    return res.status(404).json({ message: 'Grupa nie istnieje' })
  }

  if (!userId) {
    return res.status(400).json({ message: 'Brak identyfikatora użytkownika' })
  }

  if (!group.memberIds.includes(String(userId))) {
    group.memberIds.push(String(userId))
    await writeJson(groupsFile, groups)
  }

  return res.json({ group })
})

app.delete('/api/groups/:groupId/users/:userId', async (req, res) => {
  const { groupId, userId } = req.params
  const groups = await readJson(groupsFile, defaultGroups)
  const group = groups.find((entry) => entry.id === groupId)

  if (!group) {
    return res.status(404).json({ message: 'Grupa nie istnieje' })
  }

  group.memberIds = group.memberIds.filter((id) => id !== userId)
  await writeJson(groupsFile, groups)
  return res.json({ group })
})

app.get('/api/quizzes', async (_req, res) => {
  const quizzes = await readJson(quizzesFile, defaultQuizzes)
  return res.json({ quizzes })
})

app.post('/api/quizzes', async (req, res) => {
  const { name, questions } = req.body || {}

  if (!name || !String(name).trim()) {
    return res.status(400).json({ message: 'Nazwa quizu jest wymagana' })
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ message: 'Quiz musi zawierać przynajmniej jedno pytanie' })
  }

  const normalizedQuestions = questions.map((question) => ({
    question: question.question,
    options: Array.isArray(question.options) ? question.options : [],
    correctAnswer: Number(question.correctAnswer),
  }))

  const quizzes = await readJson(quizzesFile, defaultQuizzes)
  const newQuiz = {
    id: `quiz-${Date.now()}`,
    name: String(name).trim(),
    questions: normalizedQuestions,
    assignedToUsers: [],
    assignedToGroups: [],
    completedBy: [],
    enabled: true,
    createdAt: new Date().toISOString(),
  }

  quizzes.push(newQuiz)
  await writeJson(quizzesFile, quizzes)

  return res.status(201).json({ quiz: newQuiz })
})

app.put('/api/quizzes/:id/toggle', async (req, res) => {
  const { id } = req.params
  const { enabled } = req.body || {}
  const quizzes = await readJson(quizzesFile, defaultQuizzes)
  const quiz = quizzes.find((entry) => entry.id === id)

  if (!quiz) {
    return res.status(404).json({ message: 'Quiz nie istnieje' })
  }

  quiz.enabled = enabled !== false
  await writeJson(quizzesFile, quizzes)
  return res.json({ quiz })
})

app.post('/api/quizzes/assign', async (req, res) => {
  const { quizId, userIds = [], groupIds = [] } = req.body || {}
  const quizzes = await readJson(quizzesFile, defaultQuizzes)
  const groups = await readJson(groupsFile, defaultGroups)

  const quiz = quizzes.find((entry) => entry.id === quizId)
  if (!quiz) {
    return res.status(404).json({ message: 'Quiz nie istnieje' })
  }

  const nextAssignment = new Set((quiz.assignedToUsers || []).map(String))
  for (const userId of userIds) {
    nextAssignment.add(String(userId))
  }

  const groupAssignments = new Set((quiz.assignedToGroups || []).map(String))
  for (const groupId of groupIds) {
    groupAssignments.add(String(groupId))
  }

  for (const groupId of groupIds) {
    const group = groups.find((entry) => entry.id === groupId)
    if (group) {
      group.memberIds.forEach((userId) => nextAssignment.add(String(userId)))
    }
  }

  quiz.assignedToUsers = [...nextAssignment]
  quiz.assignedToGroups = [...groupAssignments]
  quiz.enabled = true

  await writeJson(quizzesFile, quizzes)
  return res.json({ quiz })
})

app.post('/api/quizzes/:id/complete', async (req, res) => {
  const { id } = req.params
  const { userId } = req.body || {}
  const quizzes = await readJson(quizzesFile, defaultQuizzes)
  const quiz = quizzes.find((entry) => entry.id === id)

  if (!quiz) {
    return res.status(404).json({ message: 'Quiz nie istnieje' })
  }

  const userIdentifier = String(userId)
  if (!userIdentifier) {
    return res.status(400).json({ message: 'Brak identyfikatora użytkownika' })
  }

  if (!Array.isArray(quiz.completedBy)) {
    quiz.completedBy = []
  }

  if (quiz.completedBy.includes(userIdentifier)) {
    return res.status(409).json({ message: 'Użytkownik już ukończył ten quiz' })
  }

  quiz.completedBy.push(userIdentifier)
  await writeJson(quizzesFile, quizzes)

  return res.json({ quiz })
})

app.get('/api/records', async (_req, res) => {
  const records = await readJson(recordsFile, defaultRecords)
  const sorted = [...records].sort((a, b) => Number(b.score) - Number(a.score)).slice(0, 30)
  return res.json({ records: sorted })
})

app.post('/api/records', async (req, res) => {
  const { name, score, date, quizName, quizId, timeSeconds, showInLeaderboard } = req.body || {}

  if (!name || score === undefined) {
    return res.status(400).json({ message: 'Brakuje danych wyniku' })
  }

  const records = await readJson(recordsFile, defaultRecords)
  const nextEntry = {
    id: `record-${Date.now()}`,
    name: String(name),
    score: Number(score),
    date: date || new Date().toISOString(),
    quizName: quizName ? String(quizName) : 'Quiz ogólny',
    quizId: quizId ? String(quizId) : '',
    timeSeconds: Number.isFinite(Number(timeSeconds)) ? Number(timeSeconds) : 0,
    showInLeaderboard: showInLeaderboard !== false,
  }

  records.push(nextEntry)
  const sortedRecords = [...records]
    .sort((a, b) => Number(b.score) - Number(a.score))
    .slice(0, 30)

  await writeJson(recordsFile, sortedRecords)

  return res.status(201).json({ record: nextEntry, records: sortedRecords })
})

app.put('/api/records/:recordId/visibility', async (req, res) => {
  const { recordId } = req.params
  const { showInLeaderboard } = req.body || {}
  const records = await readJson(recordsFile, defaultRecords)
  const item = records.find((entry) => entry.id === recordId)

  if (!item) {
    return res.status(404).json({ message: 'Rekord nie istnieje' })
  }

  item.showInLeaderboard = showInLeaderboard !== false
  await writeJson(recordsFile, records)
  return res.json({ record: item })
})

app.put('/api/records/quiz/:quizId/visibility', async (req, res) => {
  const { quizId } = req.params
  const { showInLeaderboard } = req.body || {}
  const records = await readJson(recordsFile, defaultRecords)

  let updated = 0
  for (const record of records) {
    if (record.quizId === quizId) {
      record.showInLeaderboard = showInLeaderboard !== false
      updated += 1
    }
  }

  await writeJson(recordsFile, records)
  return res.json({ updated, records })
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
  await ensureFile(groupsFile, defaultGroups)
  await ensureFile(quizzesFile, defaultQuizzes)

  app.listen(port, () => {
    console.log(`Server działa na http://localhost:${port}`)
  })
} catch (error) {
  console.error('Błąd startu serwera:', error)
  process.exit(1)
}
