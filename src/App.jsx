import { useEffect, useState } from 'react'
import './App.css'

const QUESTIONS_PER_SESSION = 10
const STORAGE_KEY = 'quantum-quiz-records'

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

const getRecords = () => {
	try {
		const stored = localStorage.getItem(STORAGE_KEY)
		return stored ? JSON.parse(stored) : []
	} catch {
		return []
	}
}

function App() {
	const [screen, setScreen] = useState('start')
	const [playerName, setPlayerName] = useState('')
	const [questions, setQuestions] = useState([])
	const [currentIndex, setCurrentIndex] = useState(0)
	const [selectedAnswer, setSelectedAnswer] = useState(null)
	const [score, setScore] = useState(0)
	const [records, setRecords] = useState(() => getRecords())

	const currentQuestion = questions[currentIndex]

	const startQuiz = () => {
		const startName = playerName.trim() || 'Gracz'
		setPlayerName(startName)
		setQuestions(createQuizSession())
		setCurrentIndex(0)
		setSelectedAnswer(null)
		setScore(0)
		setScreen('quiz')
	}

	const saveRecord = (entry) => {
		setRecords((prev) => {
			const merged = [...prev, entry]
			const sorted = merged.sort((a, b) => b.score - a.score)
			const topTen = sorted.slice(0, 10)
			localStorage.setItem(STORAGE_KEY, JSON.stringify(topTen))
			return topTen
		})
	}

	const handleAnswerClick = (optionIndex) => {
		if (selectedAnswer !== null || !currentQuestion) {
			return
		}

		const isCorrect = optionIndex === currentQuestion.correctAnswer
		const updatedScore = isCorrect ? score + 1 : score
		setSelectedAnswer(optionIndex)

		setTimeout(() => {
			const nextIndex = currentIndex + 1

			if (nextIndex >= questions.length) {
				const result = {
					name: playerName.trim() || 'Gracz',
					score: updatedScore,
					date: new Date().toISOString(),
				}

				saveRecord(result)
				setScore(updatedScore)
				setScreen('finished')
				return
			}

			setScore(updatedScore)
			setCurrentIndex(nextIndex)
			setSelectedAnswer(null)
		}, 700)
	}

	const renderStartScreen = () => (
		<div className="screen-wrap">
			<div className="panel start-panel">
				<p className="label">Fizyka kwantowa</p>
				<h1>Quiz</h1>

				<label className="input-label" htmlFor="player-name">
					Imię gracza
				</label>
				<input
					id="player-name"
					type="text"
					value={playerName}
					onChange={(event) => setPlayerName(event.target.value)}
					placeholder="Wpisz swoje imię"
					maxLength={20}
				/>

				<div className="button-group">
					<button type="button" className="primary-btn" onClick={startQuiz}>
						Start
					</button>
					<button type="button" className="secondary-btn" onClick={() => setScreen('records')}>
						Rekordy
					</button>
				</div>
			</div>
		</div>
	)

	const renderQuizScreen = () => {
		if (!currentQuestion) {
			return null
		}

		return (
			<div className="screen-wrap">
				<div className="panel quiz-panel">
					<div className="quiz-header">
						<span>Gracz: {playerName || 'Gracz'}</span>
						<span>
							Pytanie {currentIndex + 1}/{QUESTIONS_PER_SESSION}
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

	const renderFinishedScreen = () => (
		<div className="screen-wrap">
			<div className="panel result-panel">
				<p className="label">Koniec gry</p>
				<h1>{playerName}</h1>
				<p className="result-score">
					Twój wynik: <strong>{score}/{QUESTIONS_PER_SESSION}</strong>
				</p>

				<div className="button-group">
					<button type="button" className="primary-btn" onClick={startQuiz}>
						Zagraj jeszcze raz
					</button>
					<button type="button" className="secondary-btn" onClick={() => setScreen('records')}>
						Rekordy
					</button>
				</div>
			</div>
		</div>
	)

	const renderRecordsScreen = () => (
		<div className="screen-wrap">
			<div className="panel records-panel">
				<p className="label">Najlepsze wyniki</p>
				<h1>Rekordy</h1>

				{records.length === 0 ? (
					<p className="empty-state">Brak zapisanych wyników.</p>
				) : (
					<ol className="records-list">
						{records.map((record, index) => (
							<li key={`${record.name}-${record.date}-${index}`}>
								<span className="place">#{index + 1}</span>
								<span className="name">{record.name}</span>
								<span className="score">{record.score}/{QUESTIONS_PER_SESSION}</span>
							</li>
						))}
					</ol>
				)}

				<div className="button-group">
					<button type="button" className="primary-btn" onClick={() => setScreen('start')}>
						Powrót
					</button>
				</div>
			</div>
		</div>
	)

	if (screen === 'start') {
		return renderStartScreen()
	}

	if (screen === 'quiz') {
		return renderQuizScreen()
	}

	if (screen === 'records') {
		return renderRecordsScreen()
	}

	return renderFinishedScreen()
}

export default App
