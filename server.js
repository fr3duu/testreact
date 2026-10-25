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
const questionsFile = path.join(dataDir, 'questions.json')
const distDir = path.join(__dirname, 'dist')

const defaultUsers = [
  { id: 'admin-1', username: 'admin', password: 'admin123', role: 'admin' },
  { id: 'user-1', username: 'demo', password: 'demo123', role: 'user' },
]

const defaultRecords = []
const defaultGroups = []
const defaultQuizzes = []
const defaultQuestions = [
  {
    question: 'Co jest najmniejszą jednostką energii w fizyce kwantowej?',
    options: ['Proton', 'Foton', 'Kwant', 'Elektron'],
    correctAnswer: 2,
  },
  {
    question: 'Kto jest uznawany za twórcę mechaniki kwantowej?',
    options: ['Newton', 'Planck', 'Einstein', 'Bohr'],
    correctAnswer: 1,
  },
  {
    question: 'Jak nazywa się zasada mówiąca, że nie można jednocześnie dokładnie zmierzyć położenia i pędu?',
    options: ['Zasada zachowania energii', 'Zasada nieoznaczoności', 'Zasada superpozycji', 'Zasada dualizmu'],
    correctAnswer: 1,
  },
  {
    question: 'Co opisuje funkcja falowa?',
    options: ['Kolor cząstki', 'Prawdopodobieństwo jej położenia', 'Masę cząstki', 'Ładunek cząstki'],
    correctAnswer: 1,
  },
  {
    question: 'Jak nazywa się zjawisko, w którym cząstka może być w wielu stanach jednocześnie?',
    options: ['Tunelowanie', 'Superpozycja', 'Dyfrakcja', 'Interferencja'],
    correctAnswer: 1,
  },
  {
    question: 'Która cząstka jest nośnikiem światła?',
    options: ['Neutron', 'Foton', 'Gluon', 'Elektron'],
    correctAnswer: 1,
  },
  {
    question: 'Jak nazywa się zjawisko przechodzenia cząstki przez barierę, mimo że nie ma wystarczającej energii?',
    options: ['Tunelowanie kwantowe', 'Odbicie', 'Rozproszenie', 'Absorpcja'],
    correctAnswer: 0,
  },
  {
    question: 'Który eksperyment pokazał dualizm korpuskularno-falowy?',
    options: ['Wahadło Foucaulta', 'Podwójna szczelina', 'Spadek ciał Galileusza', 'Zderzenia kul bilardowych'],
    correctAnswer: 1,
  },
  {
    question: 'Elektron w atomie porusza się po…',
    options: ['Dokładnej orbicie', 'Losowej trajektorii', 'Obszarze prawdopodobieństwa', 'Linii prostej'],
    correctAnswer: 2,
  },
  {
    question: 'Jak nazywa się najmniejsza porcja światła?',
    options: ['Kwark', 'Foton', 'Boson', 'Atom'],
    correctAnswer: 1,
  },
  {
    question: 'Który fizyk opisał kota Schrödingera?',
    options: ['Heisenberg', 'Schrödinger', 'Dirac', 'Feynman'],
    correctAnswer: 1,
  },
  {
    question: 'Co oznacza „spin” cząstki?',
    options: ['Jej temperaturę', 'Rodzaj ładunku', 'Własność kwantową', 'Prędkość obrotu'],
    correctAnswer: 2,
  },
  {
    question: 'Jak nazywa się cząstka o masie bliskiej zeru i prędkości światła?',
    options: ['Proton', 'Foton', 'Neutron', 'Elektron'],
    correctAnswer: 1,
  },
  {
    question: 'Co jest podstawowym składnikiem atomu?',
    options: ['Foton', 'Kwark', 'Proton, neutron, elektron', 'Gluon'],
    correctAnswer: 2,
  },
  {
    question: 'Jak nazywa się zjawisko, w którym dwie cząstki pozostają powiązane niezależnie od odległości?',
    options: ['Dyfrakcja', 'Tunelowanie', 'Splątanie kwantowe', 'Polaryzacja'],
    correctAnswer: 2,
  },
  {
    question: 'Który fizyk wprowadził pojęcie kwantu energii?',
    options: ['Planck', 'Tesla', 'Maxwell', 'Bohr'],
    correctAnswer: 0,
  },
  {
    question: 'Co opisuje równanie Schrödingera?',
    options: ['Ruch planet', 'Zmiany temperatury', 'Zachowanie funkcji falowej', 'Prędkość światła'],
    correctAnswer: 2,
  },
  {
    question: 'Jak nazywa się zjawisko, w którym światło zachowuje się jak fala?',
    options: ['Interferencja', 'Dyfrakcja', 'Superpozycja', 'Oba powyższe'],
    correctAnswer: 3,
  },
  {
    question: 'Która cząstka ma ładunek ujemny?',
    options: ['Proton', 'Neutron', 'Elektron', 'Foton'],
    correctAnswer: 2,
  },
  {
    question: 'Co jest podstawowym założeniem mechaniki kwantowej?',
    options: ['Wszystko jest przewidywalne', 'Świat jest ciągły', 'Zjawiska są probabilistyczne', 'Cząstki nie istnieją'],
    correctAnswer: 2,
  },
]

const defaultQuestionId = (index) => `default-question-${index}`

function getQuestionCatalog(savedQuestions) {
  const defaultIds = new Set(defaultQuestions.map((_, index) => defaultQuestionId(index)))
  const savedById = new Map(savedQuestions.filter((question) => question.id).map((question) => [String(question.id), question]))
  const builtInQuestions = defaultQuestions.flatMap((question, index) => {
    const id = defaultQuestionId(index)
    const savedQuestion = savedById.get(id)
    if (savedQuestion?.deleted) {
      return []
    }
    return [{ ...question, ...savedQuestion, id }]
  })
  const customQuestions = savedQuestions.filter(
    (question) => question.id && !defaultIds.has(String(question.id)) && !question.deleted,
  )

  return [...builtInQuestions, ...customQuestions]
}

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

  const index = users.findIndex((user) => String(user.id) === id)
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
  const filtered = users.filter((user) => String(user.id) !== id)

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
  const sortedQuizzes = [...quizzes].sort((a, b) => {
    const aEnabled = a.enabled !== false
    const bEnabled = b.enabled !== false

    if (aEnabled && !bEnabled) {
      return -1
    }

    if (!aEnabled && bEnabled) {
      return 1
    }

    return 0
  })

  return res.json({ quizzes: sortedQuizzes })
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
    showInLeaderboard: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  quizzes.push(newQuiz)
  await writeJson(quizzesFile, quizzes)

  return res.status(201).json({ quiz: newQuiz })
})

app.put('/api/quizzes/:id', async (req, res) => {
  const { id } = req.params
  const { name, questions, userIds, groupIds } = req.body || {}

  if (!name || !String(name).trim()) {
    return res.status(400).json({ message: 'Nazwa quizu jest wymagana' })
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ message: 'Quiz musi zawierać przynajmniej jedno pytanie' })
  }

  if (!Array.isArray(userIds) || !Array.isArray(groupIds)) {
    return res.status(400).json({ message: 'Lista użytkowników i grup jest nieprawidłowa' })
  }

  const normalizedQuestions = questions.map((question) => {
    if (!question || typeof question !== 'object') {
      return null
    }

    const options = Array.isArray(question.options) ? question.options.map((option) => String(option).trim()) : []
    const correctAnswer = Number(question.correctAnswer)
    if (
      !question.question ||
      !String(question.question).trim() ||
      options.length !== 4 ||
      options.some((option) => !option) ||
      !Number.isInteger(correctAnswer) ||
      correctAnswer < 0 ||
      correctAnswer > 3
    ) {
      return null
    }

    return {
      question: String(question.question).trim(),
      options,
      correctAnswer,
    }
  })

  if (normalizedQuestions.some((question) => question === null)) {
    return res.status(400).json({ message: 'Każde pytanie musi mieć treść, cztery odpowiedzi i poprawny numer odpowiedzi' })
  }

  const [quizzes, users, groups] = await Promise.all([
    readJson(quizzesFile, defaultQuizzes),
    readJson(usersFile, defaultUsers),
    readJson(groupsFile, defaultGroups),
  ])
  const quiz = quizzes.find((entry) => entry.id === id)

  if (!quiz) {
    return res.status(404).json({ message: 'Quiz nie istnieje' })
  }

  const normalizedUserIds = [...new Set(userIds.map(String))]
  const normalizedGroupIds = [...new Set(groupIds.map(String))]
  const knownUserIds = new Set(users.map((user) => String(user.id)))
  const knownGroupIds = new Set(groups.map((group) => String(group.id)))

  if (
    normalizedUserIds.some((userId) => !knownUserIds.has(userId)) ||
    normalizedGroupIds.some((groupId) => !knownGroupIds.has(groupId))
  ) {
    return res.status(400).json({ message: 'Wybrany użytkownik lub grupa nie istnieje' })
  }

  quiz.name = String(name).trim()
  quiz.questions = normalizedQuestions
  quiz.assignedToUsers = normalizedUserIds
  quiz.assignedToGroups = normalizedGroupIds
  quiz.updatedAt = new Date().toISOString()

  await writeJson(quizzesFile, quizzes)
  return res.json({ quiz })
})

app.delete('/api/quizzes/:id', async (req, res) => {
  const { id } = req.params
  const quizzes = await readJson(quizzesFile, defaultQuizzes)
  const filteredQuizzes = quizzes.filter((quiz) => quiz.id !== id)

  if (filteredQuizzes.length === quizzes.length) {
    return res.status(404).json({ message: 'Quiz nie istnieje' })
  }

  await writeJson(quizzesFile, filteredQuizzes)
  return res.json({ message: 'Quiz usunięty' })
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
  quiz.updatedAt = new Date().toISOString()
  await writeJson(quizzesFile, quizzes)
  return res.json({ quiz })
})

app.put('/api/quizzes/:id/leaderboard-visibility', async (req, res) => {
  const { id } = req.params
  const { showInLeaderboard } = req.body || {}
  const quizzes = await readJson(quizzesFile, defaultQuizzes)
  const quiz = quizzes.find((entry) => entry.id === id)

  if (!quiz) {
    return res.status(404).json({ message: 'Quiz nie istnieje' })
  }

  quiz.showInLeaderboard = showInLeaderboard !== false
  quiz.updatedAt = new Date().toISOString()
  await writeJson(quizzesFile, quizzes)
  return res.json({ quiz })
})

app.post('/api/quizzes/assign', async (req, res) => {
  const { quizId, userIds = [], groupIds = [] } = req.body || {}
  const quizzes = await readJson(quizzesFile, defaultQuizzes)

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

app.get('/api/questions', async (_req, res) => {
  const savedQuestions = await readJson(questionsFile, defaultQuestions)
  return res.json({ questions: getQuestionCatalog(savedQuestions) })
})

app.post('/api/questions', async (req, res) => {
  const { question, options, correctAnswer } = req.body || {}

  if (!question || !String(question).trim()) {
    return res.status(400).json({ message: 'Treść pytania jest wymagana' })
  }

  const normalizedOptions = Array.isArray(options) ? options.map((item) => String(item).trim()).filter(Boolean) : []
  if (normalizedOptions.length !== 4) {
    return res.status(400).json({ message: 'Pytanie musi mieć dokładnie 4 odpowiedzi' })
  }

  const parsedCorrect = Number(correctAnswer)
  if (!Number.isInteger(parsedCorrect) || parsedCorrect < 0 || parsedCorrect > 3) {
    return res.status(400).json({ message: 'Poprawna odpowiedź musi być numerem od 0 do 3' })
  }

  const questions = await readJson(questionsFile, defaultQuestions)
  const newQuestion = {
    id: `question-${Date.now()}`,
    question: String(question).trim(),
    options: normalizedOptions,
    correctAnswer: parsedCorrect,
  }

  questions.push(newQuestion)
  await writeJson(questionsFile, questions)

  return res.status(201).json({ question: newQuestion })
})

app.put('/api/questions/:id', async (req, res) => {
  const { id } = req.params
  const { question, options, correctAnswer } = req.body || {}

  if (!question || !String(question).trim()) {
    return res.status(400).json({ message: 'Treść pytania jest wymagana' })
  }

  const normalizedOptions = Array.isArray(options) ? options.map((entry) => String(entry).trim()).filter(Boolean) : []
  if (normalizedOptions.length !== 4) {
    return res.status(400).json({ message: 'Pytanie musi mieć dokładnie 4 odpowiedzi' })
  }

  const parsedCorrect = Number(correctAnswer)
  if (!Number.isInteger(parsedCorrect) || parsedCorrect < 0 || parsedCorrect > 3) {
    return res.status(400).json({ message: 'Poprawna odpowiedź musi być numerem od 0 do 3' })
  }

  const questions = await readJson(questionsFile, defaultQuestions)
  const defaultIndex = defaultQuestions.findIndex((_, index) => defaultQuestionId(index) === id)
  let item = questions.find((entry) => String(entry.id) === id)

  if (!item && defaultIndex === -1) {
    return res.status(404).json({ message: 'Pytanie nie istnieje' })
  }

  if (!item) {
    item = { id }
    questions.push(item)
  }

  item.question = String(question).trim()
  item.options = normalizedOptions
  item.correctAnswer = parsedCorrect
  delete item.deleted

  await writeJson(questionsFile, questions)
  return res.json({ question: { ...item } })
})

app.delete('/api/questions/:id', async (req, res) => {
  const { id } = req.params
  const questions = await readJson(questionsFile, defaultQuestions)
  const defaultIndex = defaultQuestions.findIndex((_, index) => defaultQuestionId(index) === id)

  if (defaultIndex !== -1) {
    const existingIndex = questions.findIndex((question) => String(question.id) === id)
    if (existingIndex === -1) {
      questions.push({ id, deleted: true })
    } else {
      questions[existingIndex] = { id, deleted: true }
    }
    await writeJson(questionsFile, questions)
    return res.json({ message: 'Pytanie usunięte' })
  }

  const filtered = questions.filter((question) => String(question.id) !== id)
  if (filtered.length === questions.length) {
    return res.status(404).json({ message: 'Pytanie nie istnieje' })
  }

  await writeJson(questionsFile, filtered)
  return res.json({ message: 'Pytanie usunięte' })
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
  await ensureFile(questionsFile, defaultQuestions)

  app.listen(port, () => {
    console.log(`Server działa na http://localhost:${port}`)
  })
} catch (error) {
  console.error('Błąd startu serwera:', error)
  process.exit(1)
}
