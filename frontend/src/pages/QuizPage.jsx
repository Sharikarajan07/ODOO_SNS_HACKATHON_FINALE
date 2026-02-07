import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { Button, Card, Badge } from '../components/ui'
import { ArrowLeft, ArrowRight, Trophy } from 'lucide-react'
import api from '../services/api'

const QuizPage = () => {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [attempts, setAttempts] = useState([])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuiz()
  }, [quizId])

  const fetchQuiz = async () => {
    try {
      // Get quiz by course ID (the quizId param is actually a quiz ID)
      const quizRes = await api.get(`/quizzes/${quizId}`)
      setQuiz(quizRes.data || null)

      // Fetch previous attempts
      const attemptsRes = await api.get(`/quizzes/${quizId}/attempts`)
      setAttempts(attemptsRes.data)
    } catch (error) {
      console.error('Failed to fetch quiz', error)
      // Try to get quiz by course ID instead
      try {
        const courseId = quizId // Assuming quizId might be courseId
        const response = await api.get(`/quizzes/course/${courseId}`)
        setQuiz(response.data)
        if (response.data) {
          const attemptsRes = await api.get(`/quizzes/${response.data.id}/attempts`)
          setAttempts(attemptsRes.data)
        }
      } catch (err) {
        console.error('Failed to fetch quiz by course', err)
      }
    } finally {
      setLoading(false)
    }
  }

  const selectAnswer = (questionId, optionId) => {
    setAnswers({
      ...answers,
      [questionId]: optionId
    })
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const submitQuiz = async () => {
    if (Object.keys(answers).length < quiz.questions.length) {
      if (!confirm('You have not answered all questions. Submit anyway?')) {
        return
      }
    }

    try {
      const response = await api.post(`/quizzes/${quiz.id}/attempt`, { answers })
      setResult(response.data)
      alert(`Quiz completed! Score: ${response.data.attempt.score.toFixed(0)}%`)
    } catch (error) {
      alert('Failed to submit quiz')
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading...</div>
      </Layout>
    )
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <Layout>
        <Card className="text-center py-12">
          <p className="text-gray-500 mb-4">No quiz available for this course</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </Card>
      </Layout>
    )
  }

  if (result) {
    return (
      <Layout title="Quiz Results">
        <Card className="max-w-2xl mx-auto text-center py-12">
          <Trophy className="mx-auto text-yellow-500 mb-4" size={64} />
          <h1 className="text-3xl font-bold mb-4">Quiz Completed!</h1>
          <div className="space-y-4 mb-6">
            <div>
              <p className="text-gray-600">Your Score</p>
              <p className="text-5xl font-bold text-primary-600">
                {result.attempt.score.toFixed(0)}%
              </p>
            </div>
            {result.pointsAwarded !== undefined && (
              <>
                <div>
                  <p className="text-gray-600">Points Earned</p>
                  <p className="text-3xl font-bold text-green-600">
                    +{result.pointsAwarded} points
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Total Points</p>
                  <p className="text-2xl font-semibold">{result.totalPoints}</p>
                </div>
                <div>
                  <p className="text-gray-600">Your Badge</p>
                  <Badge variant="primary" className="text-lg px-4 py-2">
                    {result.badge}
                  </Badge>
                </div>
              </>
            )}
          </div>
          <div className="flex space-x-4 justify-center">
            <Button onClick={() => {
              setResult(null)
              setAnswers({})
              setCurrentQuestionIndex(0)
            }}>
              Retake Quiz
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)}>
              Back to Course
            </Button>
          </div>
        </Card>
      </Layout>
    )
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1
  const isFirstQuestion = currentQuestionIndex === 0

  return (
    <Layout title={quiz.title}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} className="inline mr-2" />
            Back to Course
          </Button>
        </div>

        {/* Previous Attempts */}
        {attempts.length > 0 && (
          <Card className="mb-6">
            <h3 className="font-semibold mb-2">Previous Attempts</h3>
            <div className="flex space-x-4">
              {attempts.slice(0, 5).map((attempt, idx) => (
                <div key={attempt.id} className="text-center">
                  <p className="text-xs text-gray-600">Attempt {attempts.length - idx}</p>
                  <p className="text-lg font-bold">{attempt.score.toFixed(0)}%</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Quiz Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
            <span className="text-sm text-gray-600">
              Answered: {Object.keys(answers).length} / {quiz.questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <Card>
          <h2 className="text-2xl font-bold mb-6">{currentQuestion.questionText}</h2>
          
          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((option, index) => {
              const isSelected = answers[currentQuestion.id] === option.id
              
              return (
                <div
                  key={option.id}
                  onClick={() => selectAnswer(currentQuestion.id, option.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                      isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-300'
                    }`}>
                      {isSelected && <div className="w-3 h-3 bg-white rounded-full" />}
                    </div>
                    <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                    <span>{option.optionText}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={previousQuestion}
              disabled={isFirstQuestion}
            >
              <ArrowLeft size={16} className="inline mr-2" />
              Previous
            </Button>

            <div className="flex space-x-2">
              {quiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-8 h-8 rounded ${
                    index === currentQuestionIndex
                      ? 'bg-primary-600 text-white'
                      : answers[quiz.questions[index].id]
                      ? 'bg-green-200 text-green-800'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {isLastQuestion ? (
              <Button onClick={submitQuiz}>
                Submit Quiz
              </Button>
            ) : (
              <Button onClick={nextQuestion}>
                Next
                <ArrowRight size={16} className="inline ml-2" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  )
}

export default QuizPage
