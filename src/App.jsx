import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from './api'
import './App.css'

const QUESTIONS_PER_SESSION = 10

const allQuestions = [
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
		question:
			'Jak nazywa się zasada mówiąca, że nie można jednocześnie dokładnie zmierzyć położenia i pędu?',
		options: [
			'Zasada zachowania energii',
			'Zasada nieoznaczoności',
			'Zasada superpozycji',
			'Zasada dualizmu',
		],
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
		question:
			'Jak nazywa się zjawisko przechodzenia cząstki przez barierę, mimo że nie ma wystarczającej energii?',
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
		question:
			'Jak nazywa się zjawisko, w którym dwie cząstki pozostają powiązane niezależnie od odległości?',
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

const createQuizSession = () => {
	const shuffled = [...allQuestions].sort(() => Math.random() - 0.5)
	return shuffled.slice(0, QUESTIONS_PER_SESSION)
}

function App() {
	const [screen, setScreen] = useState('login')
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [currentUser, setCurrentUser] = useState(null)
	const [users, setUsers] = useState([])
	const [groups, setGroups] = useState([])
	const [quizzes, setQuizzes] = useState([])
	const [assignedQuizzes, setAssignedQuizzes] = useState([])
	const [records, setRecords] = useState([])
	const [questionList, setQuestionList] = useState([])
	const [currentIndex, setCurrentIndex] = useState(0)
	const [selectedAnswer, setSelectedAnswer] = useState(null)
	const [score, setScore] = useState(0)
	const [loading, setLoading] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [newUserForm, setNewUserForm] = useState({ username: '', password: '', role: 'user' })
	const [passwordForm, setPasswordForm] = useState({ userId: '', password: '' })
	const [newGroupName, setNewGroupName] = useState('')
	const [groupUserAssignments, setGroupUserAssignments] = useState({})
	const [quizForm, setQuizForm] = useState({
		name: '',
		count: 5,
		selectedQuestionIds: [],
		assignToUsers: [],
		assignToGroups: [],
	})
	const [activeQuiz, setActiveQuiz] = useState(null)
	const [adminTab, setAdminTab] = useState('users')

	const currentQuestion = questionList[currentIndex]
	const canManageUsers = currentUser?.role === 'admin'
	const topRecords = useMemo(() => [...records].sort((a, b) => b.score - a.score).slice(0, 10), [records])

	const refreshAdminData = async () => {
		try {
			const [usersResponse, recordsResponse, groupsResponse, quizzesResponse] = await Promise.all([
				apiRequest('/users'),
				apiRequest('/records'),
				apiRequest('/groups'),
				apiRequest('/quizzes'),
			])

			setUsers(usersResponse.users || [])
			setRecords(recordsResponse.records || [])
			setGroups(groupsResponse.groups || [])
			setQuizzes(quizzesResponse.quizzes || [])
		} catch (error) {
			console.error(error)
		}
	}

	const loadAssignedQuizzes = async (userId) => {
		if (!userId) {
			setAssignedQuizzes([])
			return
		}

		try {
			const response = await apiRequest(`/users/${userId}/quizzes`)
			setAssignedQuizzes(response.quizzes || [])
		} catch (error) {
			console.error(error)
			setAssignedQuizzes([])
		}
	}

	useEffect(() => {
		refreshAdminData()
	}, [])

	useEffect(() => {
		if (currentUser) {
			loadAssignedQuizzes(currentUser.id)
		} else {
			setAssignedQuizzes([])
		}
	}, [currentUser])

	useEffect(() => {
		if (screen !== 'quiz' && screen !== 'custom-quiz') {
			return
		}

		if (screen === 'custom-quiz' && activeQuiz?.questions?.length) {
			setQuestionList(activeQuiz.questions)
			setCurrentIndex(0)
			setSelectedAnswer(null)
			setScore(0)
			return
		}

		setQuestionList(createQuizSession())
		setCurrentIndex(0)
		setSelectedAnswer(null)
		setScore(0)
	}, [screen, activeQuiz])

	const handleLogin = async (event) => {
		event.preventDefault()
		setLoading(true)
		setErrorMessage('')

		try {
			const response = await apiRequest('/login', {
				method: 'POST',
				body: JSON.stringify({ username, password }),
			})

			setCurrentUser(response.user)
			setScreen('home')
			setUsername('')
			setPassword('')
		} catch (error) {
			setErrorMessage(error.message)
		} finally {
			setLoading(false)
		}
	}

	const handleStartQuiz = () => {
		setActiveQuiz(null)
		setQuestionList(createQuizSession())
		setCurrentIndex(0)
		setSelectedAnswer(null)
		setScore(0)
		setScreen('quiz')
	}

	const markQuizCompleted = async (quizId) => {
		if (!currentUser) {
			return
		}

		try {
			await apiRequest(`/quizzes/${quizId}/complete`, {
				method: 'POST',
				body: JSON.stringify({ userId: currentUser.id }),
			})
			await loadAssignedQuizzes(currentUser.id)
		} catch (error) {
			console.error(error)
		}
	}

	const handleStartAssignedQuiz = (quiz) => {
		if (quiz.completed) {
			return
		}

		setActiveQuiz({
			id: quiz.id,
			name: quiz.name,
			questions: Array.isArray(quiz.questions) ? quiz.questions : [],
		})
		setScreen('custom-quiz')
	}

	const handleAnswerClick = (optionIndex) => {
		if (selectedAnswer !== null || !currentQuestion) {
			return
		}

		const isCorrect = optionIndex === currentQuestion.correctAnswer
		const updatedScore = isCorrect ? score + 1 : score
		setSelectedAnswer(optionIndex)

		setTimeout(async () => {
			const nextIndex = currentIndex + 1

			if (nextIndex >= questionList.length) {
				const result = {
					name: currentUser?.username || 'Gracz',
					score: updatedScore,
					date: new Date().toISOString(),
					quizName: activeQuiz?.name || 'Quiz ogólny',
					quizId: activeQuiz?.id || '',
				}

				try {
					const response = await apiRequest('/records', {
						method: 'POST',
						body: JSON.stringify(result),
					})

					setRecords(response.records || [])
					if (activeQuiz?.id) {
						await markQuizCompleted(activeQuiz.id)
					}
				} catch (error) {
					console.error(error)
				}

				setScore(updatedScore)
				setScreen('result')
				return
			}

			setScore(updatedScore)
			setCurrentIndex(nextIndex)
			setSelectedAnswer(null)
		}, 700)
	}

	const handleCreateUser = async (event) => {
		event.preventDefault()

		try {
			const response = await apiRequest('/users', {
				method: 'POST',
				body: JSON.stringify({
					username: newUserForm.username,
					password: newUserForm.password,
					role: newUserForm.role,
				}),
			})

			setUsers((prev) => [...prev, response.user])
			setNewUserForm({ username: '', password: '', role: 'user' })
		} catch (error) {
			setErrorMessage(error.message)
		}
	}

	const handleDeleteUser = async (userId) => {
		try {
			await apiRequest(`/users/${userId}`, { method: 'DELETE' })
			setUsers((prev) => prev.filter((user) => user.id !== userId))
		} catch (error) {
			setErrorMessage(error.message)
		}
	}

	const handlePasswordChange = async (event) => {
		event.preventDefault()

		try {
			await apiRequest(`/users/${passwordForm.userId}`, {
				method: 'PUT',
				body: JSON.stringify({ password: passwordForm.password }),
			})

			setPasswordForm({ userId: '', password: '' })
		} catch (error) {
			setErrorMessage(error.message)
		}
	}

	const handleCreateGroup = async (event) => {
		event.preventDefault()

		if (!newGroupName.trim()) {
			setErrorMessage('Nazwa grupy jest wymagana')
			return
		}

		try {
			await apiRequest('/groups', {
				method: 'POST',
				body: JSON.stringify({ name: newGroupName }),
			})

			setNewGroupName('')
			await refreshAdminData()
		} catch (error) {
			setErrorMessage(error.message)
		}
	}

	const handleAddUserToGroup = async (groupId, userId) => {
		if (!userId) {
			return
		}

		try {
			await apiRequest(`/groups/${groupId}/users`, {
				method: 'POST',
				body: JSON.stringify({ userId }),
			})

			await refreshAdminData()
		} catch (error) {
			setErrorMessage(error.message)
		}
	}

	const handleRemoveUserFromGroup = async (groupId, userId) => {
		try {
			await apiRequest(`/groups/${groupId}/users/${userId}`, { method: 'DELETE' })
			await refreshAdminData()
		} catch (error) {
			setErrorMessage(error.message)
		}
	}

	const handleCreateQuiz = async (event) => {
		event.preventDefault()

		if (!quizForm.name.trim()) {
			setErrorMessage('Nazwa quizu jest wymagana')
			return
		}

		const selectedQuestions = allQuestions.filter((_, index) => quizForm.selectedQuestionIds.includes(index))
		if (!selectedQuestions.length) {
			setErrorMessage('Wybierz co najmniej jedno pytanie')
			return
		}

		const count = Number(quizForm.count) || selectedQuestions.length
		const limitedQuestions = selectedQuestions.slice(0, Math.min(count, selectedQuestions.length))

		try {
			const createdQuiz = await apiRequest('/quizzes', {
				method: 'POST',
				body: JSON.stringify({
					name: quizForm.name,
					questions: limitedQuestions,
				}),
			})

			const userIds = users
				.filter((user) => quizForm.assignToUsers.includes(user.id))
				.map((user) => user.id)

			const groupIds = groups
				.filter((group) => quizForm.assignToGroups.includes(group.id))
				.map((group) => group.id)

			await apiRequest('/quizzes/assign', {
				method: 'POST',
				body: JSON.stringify({
					quizId: createdQuiz.quiz.id,
					userIds,
					groupIds,
				}),
			})

			setQuizForm({
				name: '',
				count: 5,
				selectedQuestionIds: [],
				assignToUsers: [],
				assignToGroups: [],
			})
			setErrorMessage('')
			await refreshAdminData()
		} catch (error) {
			setErrorMessage(error.message)
		}
	}

	const handleToggleQuiz = async (quizId, enabled) => {
		try {
			await apiRequest(`/quizzes/${quizId}/toggle`, {
				method: 'PUT',
				body: JSON.stringify({ enabled }),
			})
			setQuizzes((prev) => prev.map((quiz) => (quiz.id === quizId ? { ...quiz, enabled } : quiz)))
		} catch (error) {
			setErrorMessage(error.message)
		}
	}

	const renderLogin = () => (
		<div className="screen-wrap">
			<div className="panel">
				<p className="label">Fizyka kwantowa</p>
				<h1>Logowanie</h1>

				<form onSubmit={handleLogin} className="form-stack">
					<label className="input-label" htmlFor="username">Nazwa użytkownika</label>
					<input
						id="username"
						value={username}
						onChange={(event) => setUsername(event.target.value)}
						placeholder="np. admin"
					/>

					<label className="input-label" htmlFor="password">Hasło</label>
					<input
						id="password"
						type="password"
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						placeholder="Wpisz hasło"
					/>

					{errorMessage && <p className="error-text">{errorMessage}</p>}

					<button type="submit" className="primary-btn" disabled={loading}>
						{loading ? 'Logowanie...' : 'Zaloguj się'}
					</button>
				</form>
			</div>
		</div>
	)

	const renderHome = () => (
		<div className="screen-wrap">
			<div className="panel home-panel">
				<p className="label">Witaj</p>
				<h1>{currentUser?.username}</h1>
				<p className="user-role">Rola: {currentUser?.role}</p>

				{assignedQuizzes.length > 0 && (
					<div className="notice-box">
						<p className="notice-title">Nowe quizy</p>
						<div className="notice-list">
							{assignedQuizzes.map((quiz) => (
								<button
									key={quiz.id}
									type="button"
									className="quiz-notice-btn"
									onClick={() => handleStartAssignedQuiz(quiz)}
									disabled={quiz.completed || quiz.enabled === false}
									title={quiz.completed ? 'Quiz już ukończony' : quiz.enabled === false ? 'Quiz wyłączony' : `Rozpocznij ${quiz.name}`}
								>
									{quiz.completed ? `${quiz.name} (ukończony)` : quiz.name}
								</button>
							))}
						</div>
					</div>
				)}

				<div className="button-group">
					<button type="button" className="primary-btn" onClick={handleStartQuiz}>
						Rozpocznij quiz
					</button>
					<button type="button" className="secondary-btn" onClick={() => setScreen('records')}>
						Rekordy
					</button>
					{canManageUsers && (
						<button type="button" className="secondary-btn" onClick={() => setScreen('admin')}>
							Zarządzaj
						</button>
					)}
					<button
						type="button"
						className="secondary-btn"
						onClick={() => {
							setCurrentUser(null)
							setScreen('login')
						}}
					>
						Wyloguj
					</button>
				</div>
			</div>
		</div>
	)

	const renderQuiz = () => {
		if (!currentQuestion) {
			return null
		}

		return (
			<div className="screen-wrap">
				<div className="panel quiz-panel">
					<div className="quiz-header">
						<span>Gracz: {currentUser?.username || 'Gość'}</span>
						<span>
							{activeQuiz?.name ? `${activeQuiz.name} • ` : ''}Pytanie {currentIndex + 1}/{questionList.length}
						</span>
					</div>

					<h2>{currentQuestion.question}</h2>

					<div className="answers-grid">
						{currentQuestion.options.map((option, optionIndex) => {
							const isSelected = selectedAnswer === optionIndex
							const isCorrect = currentQuestion.correctAnswer === optionIndex
							const showCorrect = selectedAnswer !== null && isCorrect
							const showWrong = selectedAnswer === optionIndex && selectedAnswer !== currentQuestion.correctAnswer

							return (
								<button
									key={option}
									type="button"
									className={[
										'answer-btn',
										isSelected ? 'selected' : '',
										showCorrect ? 'correct' : '',
										showWrong ? 'wrong' : '',
									]
										.filter(Boolean)
										.join(' ')}
									onClick={() => handleAnswerClick(optionIndex)}
									disabled={selectedAnswer !== null}
								>
									{option}
								</button>
							)
						})}
					</div>
				</div>
			</div>
		)
	}

	const renderResult = () => (
		<div className="screen-wrap">
			<div className="panel result-panel">
				<p className="label">Koniec gry</p>
				<h1>{currentUser?.username || 'Gracz'}</h1>
				<p className="result-score">
					Twój wynik: <strong>{score}/{questionList.length || QUESTIONS_PER_SESSION}</strong>
				</p>

				<div className="button-group">
					<button type="button" className="primary-btn" onClick={handleStartQuiz}>
						Zagraj jeszcze raz
					</button>
					<button type="button" className="secondary-btn" onClick={() => setScreen('home')}>
						Strona główna
					</button>
				</div>
			</div>
		</div>
	)

	const renderRecords = () => (
		<div className="screen-wrap">
			<div className="panel records-panel">
				<p className="label">Najlepsze wyniki</p>
				<h1>Rekordy</h1>

				{topRecords.length === 0 ? (
					<p className="empty-state">Brak zapisanych wyników.</p>
				) : (
					<ol className="records-list">
						{topRecords.map((record, index) => (
							<li key={`${record.name}-${record.date}-${index}`}>
								<span className="place">#{index + 1}</span>
								<span className="name">{record.name}</span>
								<span className="score">{record.score}/{QUESTIONS_PER_SESSION}</span>
							</li>
						))}
					</ol>
				)}

				<div className="button-group">
					<button type="button" className="primary-btn" onClick={() => setScreen(currentUser ? 'home' : 'login')}>
						Powrót
					</button>
				</div>
			</div>
		</div>
	)

	const renderAdminPanel = () => (
		<div className="screen-wrap">
			<div className="panel admin-panel">
				<p className="label">Admin</p>
				<h1>Zarządzanie</h1>

				<div className="admin-tabs">
					<button type="button" className={adminTab === 'users' ? 'tab-btn active' : 'tab-btn'} onClick={() => setAdminTab('users')}>
						Użytkownicy i grupy
					</button>
					<button type="button" className={adminTab === 'quizzes' ? 'tab-btn active' : 'tab-btn'} onClick={() => setAdminTab('quizzes')}>
						Quizy
					</button>
				</div>

				{adminTab === 'users' && (
					<>
						<section className="admin-section">
							<h2>Dodaj użytkownika</h2>
							<form onSubmit={handleCreateUser} className="admin-form">
								<input
									placeholder="Nazwa użytkownika"
									value={newUserForm.username}
									onChange={(event) => setNewUserForm((prev) => ({ ...prev, username: event.target.value }))}
								/>
								<input
									type="password"
									placeholder="Hasło"
									value={newUserForm.password}
									onChange={(event) => setNewUserForm((prev) => ({ ...prev, password: event.target.value }))}
								/>
								<select
									value={newUserForm.role}
									onChange={(event) => setNewUserForm((prev) => ({ ...prev, role: event.target.value }))}
								>
									<option value="user">Użytkownik</option>
									<option value="admin">Admin</option>
								</select>
								<button type="submit" className="primary-btn">Dodaj użytkownika</button>
							</form>
						</section>

						<section className="admin-section">
							<h2>Grupy</h2>
							<form onSubmit={handleCreateGroup} className="admin-form compact-form">
								<input
									placeholder="Nazwa grupy"
									value={newGroupName}
									onChange={(event) => setNewGroupName(event.target.value)}
								/>
								<button type="submit" className="primary-btn">Dodaj grupę</button>
							</form>

							<div className="group-list">
								{groups.length === 0 ? (
									<p className="empty-state">Brak grup.</p>
								) : (
									groups.map((group) => {
										const groupMembers = users.filter((user) => group.memberIds.includes(user.id))
										return (
											<div key={group.id} className="group-card">
												<div className="group-header">
													<strong>{group.name}</strong>
													<span>{groupMembers.length} użytkowników</span>
												</div>

												<div className="group-members">
													{groupMembers.length ? (
														groupMembers.map((member) => (
															<span key={member.id} className="member-badge">
																{member.username}
																<button type="button" onClick={() => handleRemoveUserFromGroup(group.id, member.id)}>
																	×
																</button>
															</span>
														))
													) : (
														<span className="muted">Brak użytkowników</span>
													)}
												</div>

												<div className="inline-form">
													<select
														value={groupUserAssignments[group.id] || ''}
														onChange={(event) =>
															setGroupUserAssignments((prev) => ({ ...prev, [group.id]: event.target.value }))
														}
													>
														<option value="">Wybierz użytkownika</option>
														{users.map((user) => (
															<option key={user.id} value={user.id}>
																{user.username}
															</option>
														))}
													</select>
													<button
														type="button"
														className="secondary-btn small"
														onClick={() => {
															const userId = groupUserAssignments[group.id]
															if (userId) {
																handleAddUserToGroup(group.id, userId)
															}
														}}
													>
														Dodaj
													</button>
												</div>
											</div>
										)
									})
								)}
							</div>
						</section>

						<section className="admin-section">
							<h2>Użytkownicy</h2>
							<div className="admin-user-list">
								{users.map((user) => (
									<div key={user.id} className="admin-user-row">
										<div>
											<strong>{user.username}</strong>
											<span>({user.role})</span>
										</div>
										<div className="admin-actions">
											<button
												type="button"
												className="secondary-btn small"
												onClick={() => setPasswordForm({ userId: user.id, password: '' })}
											>
												Zmień hasło
											</button>
											<button type="button" className="danger-btn" onClick={() => handleDeleteUser(user.id)}>
												Usuń
											</button>
										</div>
									</div>
								))}
							</div>

							{passwordForm.userId && (
								<form onSubmit={handlePasswordChange} className="password-form">
									<input
										type="password"
										placeholder="Nowe hasło"
										value={passwordForm.password}
										onChange={(event) => setPasswordForm((prev) => ({ ...prev, password: event.target.value }))}
									/>
									<button type="submit" className="primary-btn">Zapisz hasło</button>
								</form>
							)}
						</section>
					</>
				)}

				{adminTab === 'quizzes' && (
					<>
						<section className="admin-section">
							<h2>Utwórz nowy quiz</h2>
							<form onSubmit={handleCreateQuiz} className="admin-form">
								<input
									placeholder="Nazwa quizu"
									value={quizForm.name}
									onChange={(event) => setQuizForm((prev) => ({ ...prev, name: event.target.value }))}
								/>

								<label className="input-label left-align">Ilość pytań</label>
								<input
									type="number"
									min="1"
									max={allQuestions.length}
									value={quizForm.count}
									onChange={(event) => setQuizForm((prev) => ({ ...prev, count: Number(event.target.value) || 1 }))}
								/>

								<div className="question-selection">
									{allQuestions.map((question, index) => (
										<label key={`${question.question}-${index}`} className="checkbox-row">
											<input
												type="checkbox"
												checked={quizForm.selectedQuestionIds.includes(index)}
												onChange={() => {
													setQuizForm((prev) => {
														const alreadySelected = prev.selectedQuestionIds.includes(index)
														return {
															...prev,
															selectedQuestionIds: alreadySelected
																? prev.selectedQuestionIds.filter((item) => item !== index)
																: [...prev.selectedQuestionIds, index],
														}
													})
												}}
											/>
											<span>{question.question}</span>
										</label>
									))}
								</div>

								<div className="assignment-grid">
									<div>
										<h3>Użytkownicy</h3>
										{users.map((user) => (
											<label key={user.id} className="checkbox-row small-row">
												<input
													type="checkbox"
													checked={quizForm.assignToUsers.includes(user.id)}
													onChange={() =>
														setQuizForm((prev) => ({
															...prev,
															assignToUsers: prev.assignToUsers.includes(user.id)
																? prev.assignToUsers.filter((id) => id !== user.id)
																: [...prev.assignToUsers, user.id],
														}))
													}
												/>
												<span>{user.username}</span>
											</label>
										))}
									</div>

									<div>
										<h3>Grupy</h3>
										{groups.map((group) => (
											<label key={group.id} className="checkbox-row small-row">
												<input
													type="checkbox"
													checked={quizForm.assignToGroups.includes(group.id)}
													onChange={() =>
														setQuizForm((prev) => ({
															...prev,
															assignToGroups: prev.assignToGroups.includes(group.id)
																? prev.assignToGroups.filter((id) => id !== group.id)
																: [...prev.assignToGroups, group.id],
														}))
													}
												/>
												<span>{group.name}</span>
											</label>
										))}
									</div>
								</div>

								<button type="submit" className="primary-btn">Utwórz i przypisz quiz</button>
							</form>
						</section>

						<section className="admin-section">
							<h2>Zarządzanie istniejącymi quizami</h2>
							{quizzes.length === 0 ? (
								<p className="empty-state">Brak utworzonych quizów.</p>
							) : (
								<div className="quiz-management-list">
									{quizzes.map((quiz) => (
										<div key={quiz.id} className="quiz-card">
											<div className="quiz-card-header">
												<strong>{quiz.name}</strong>
												<span className={quiz.enabled === false ? 'status-badge disabled' : 'status-badge enabled'}>
													{quiz.enabled === false ? 'Wyłączone' : 'Włączone'}
												</span>
											</div>

											<p>{quiz.questions?.length || 0} pytań</p>

											<div className="quiz-card-actions">
												<button
													type="button"
													className={quiz.enabled === false ? 'secondary-btn small' : 'danger-btn small'}
													onClick={() => handleToggleQuiz(quiz.id, quiz.enabled === false)}
												>
													{quiz.enabled === false ? 'Włącz' : 'Wyłącz'}
												</button>
											</div>
										</div>
									))}
								</div>
							)}
						</section>
					</>
				)}

				{errorMessage && <p className="error-text">{errorMessage}</p>}

				<div className="button-group">
					<button type="button" className="primary-btn" onClick={() => setScreen('home')}>
						Powrót
					</button>
				</div>
			</div>
		</div>
	)

	if (screen === 'login') {
		return renderLogin()
	}

	if (screen === 'home') {
		return renderHome()
	}

	if (screen === 'quiz' || screen === 'custom-quiz') {
		return renderQuiz()
	}

	if (screen === 'result') {
		return renderResult()
	}

	if (screen === 'records') {
		return renderRecords()
	}

	if (screen === 'admin') {
		return renderAdminPanel()
	}

	return renderLogin()
}

export default App
