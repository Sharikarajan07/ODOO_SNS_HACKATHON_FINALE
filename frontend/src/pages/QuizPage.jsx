import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Card, Badge } from '../components/ui'
import { ArrowLeft, ArrowRight, Trophy, CheckCircle, Menu, X, PlayCircle, FileText, Image as ImageIcon, HelpCircle } from 'lucide-react'
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
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [allLessons, setAllLessons] = useState([])
  const [progressData, setProgressData] = useState([])
  const [courseProgress, setCourseProgress] = useState(0)

  useEffect(() => {
    if (window.innerWidth < 768) setSidebarOpen(false)
    fetchQuizAndContext()
  }, [quizId])

  const fetchQuizAndContext = async () => {
    try {
      // 1. Fetch Quiz
      let quizData = null
      try {
        const res = await api.get(`/quizzes/${quizId}`)
        quizData = res.data
      } catch (e) {
        // Fallback: try by course ID if param was courseId
        const res = await api.get(`/quizzes/course/${quizId}`)
        quizData = res.data
      }
      setQuiz(quizData)

      if (quizData) {
        // 2. Fetch Attempts
        const attemptsRes = await api.get(`/quizzes/${quizData.id}/attempts`)
        setAttempts(attemptsRes.data)

        // 3. Fetch Course Context for Sidebar
        const courseId = quizData.courseId
        const [lessonsRes, progressRes] = await Promise.all([
          api.get(`/lessons/course/${courseId}`),
          api.get(`/progress/course/${courseId}`)
        ])
        setAllLessons(lessonsRes.data)
        setProgressData(progressRes.data)

        // Calculate progress
        const completedCount = progressRes.data.filter(p => p.completed).length
        setCourseProgress(lessonsRes.data.length > 0 ? (completedCount / lessonsRes.data.length) * 100 : 0)
      }
    } catch (error) {
      console.error('Failed to load quiz context', error)
    } finally {
      setLoading(false)
    }
  }

  const selectAnswer = (questionId, optionId) => {
    setAnswers({ ...answers, [questionId]: optionId })
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
      if (!confirm('You have not answered all questions. Submit anyway?')) return
    }
    try {
      const response = await api.post(`/quizzes/${quiz.id}/attempt`, { answers })
      setResult(response.data)
      setAttempts([response.data.attempt, ...attempts])
    } catch (error) {
      alert('Failed to submit quiz')
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-900">Loading...</div>
  if (!quiz) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-900">Quiz not found</div>

  return (
    <div className="flex h-screen bg-white text-gray-900 overflow-hidden">
      {/* Sidebar (Reused/Duplicated from LessonPlayer for consistency) */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed md:relative z-30 w-80 h-full bg-gray-50 border-r border-gray-200 transition-transform duration-300 ease-in-out flex flex-col shadow-lg`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900 truncate max-w-[200px]">{quiz.course?.title || 'Course'}</h2>
            <div className="flex items-center mt-1">
              <div className="flex-1 h-1 bg-gray-200 rounded-full w-24 mr-2">
                <div className="h-1 bg-green-500 rounded-full" style={{ width: `${courseProgress}%` }} />
              </div>
              <span className="text-xs text-gray-600">{Math.round(courseProgress)}%</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-600 hover:text-gray-900"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {allLessons.map((l, idx) => {
            const isCompleted = progressData.find(p => p.id === l.id)?.completed
            return (
              <div key={l.id} onClick={() => navigate(`/lesson/${l.id}`)} className="flex items-center p-4 cursor-pointer hover:bg-gray-100 transition-colors border-l-4 border-transparent opacity-60 hover:opacity-100">
                <div className="mr-3">
                  {isCompleted ? <CheckCircle size={18} className="text-green-500" /> : <PlayCircle size={18} className="text-gray-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-gray-700">{idx + 1}. {l.title}</p>
                </div>
              </div>
            )
          })}
          {/* Quiz Entry in Sidebar */}
          <div className="flex items-center p-4 cursor-pointer bg-indigo-50 border-l-4 border-indigo-500">
            <div className="mr-3"><HelpCircle size={18} className="text-indigo-600" /></div>
            <div className="flex-1"><p className="text-sm font-medium text-gray-900">Final Quiz</p></div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <Button variant="outline" className="w-full justify-center" onClick={() => navigate(`/course/${quiz.courseId}`)}>
            <ArrowLeft size={16} className="mr-2" /> Back to Course
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-gray-50">
        <div className="md:hidden flex items-center p-4 bg-white border-b border-gray-200">
          <button onClick={() => setSidebarOpen(true)} className="mr-4 text-gray-900"><Menu size={24} /></button>
          <span className="font-semibold text-gray-900">{quiz.title}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-3xl mx-auto">

            {/* Result View */}
            {result ? (
              <Card className="text-center py-12 bg-white border-gray-200 text-gray-900 shadow-lg">
                <Trophy className="mx-auto text-yellow-500 mb-6" size={64} />
                <h1 className="text-3xl font-bold mb-4 text-gray-900">Quiz Completed!</h1>
                <p className="text-5xl font-bold text-indigo-600 mb-2">{result.attempt.score.toFixed(0)}%</p>

                {result.pointsAwarded !== undefined && (
                  <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg inline-block">
                    <p className="text-green-600 font-bold text-xl">+{result.pointsAwarded} Points Earned!</p>
                    <p className="text-gray-600 text-sm mt-1">Total Points: {result.totalPoints}</p>
                    <Badge className="mt-2 bg-indigo-600">{result.badge}</Badge>
                  </div>
                )}

                <div className="flex justify-center gap-4">
                  <Button onClick={() => { setResult(null); setAnswers({}); setCurrentQuestionIndex(0); }}>Retake Quiz</Button>
                  <Button variant="secondary" onClick={() => navigate(`/course/${quiz.courseId}`)}>Finish Course</Button>
                </div>
              </Card>
            ) : (
              /* Quiz View */
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
                  <span className="text-gray-600">{currentQuestionIndex + 1}/{quiz.questions.length}</span>
                </div>

                {/* Question Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
                  <h2 className="text-xl md:text-2xl font-semibold mb-8 text-gray-900">{quiz.questions[currentQuestionIndex].questionText}</h2>

                  <div className="space-y-3">
                    {quiz.questions[currentQuestionIndex].options.map((option, idx) => {
                      const isSelected = answers[quiz.questions[currentQuestionIndex].id] === option.id
                      return (
                        <div
                          key={option.id}
                          onClick={() => selectAnswer(quiz.questions[currentQuestionIndex].id, option.id)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center ${isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
                            }`}
                        >
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 ${isSelected ? 'border-indigo-500 text-indigo-600 font-semibold' : 'border-gray-400 text-gray-600'
                            }`}>
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <span className="text-lg text-gray-900">{option.optionText}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={previousQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ArrowLeft size={20} className="mr-2" /> Previous
                  </Button>

                  {currentQuestionIndex === quiz.questions.length - 1 ? (
                    <Button onClick={submitQuiz} className="bg-green-600 hover:bg-green-700 text-white px-8">Submit Quiz</Button>
                  ) : (
                    <Button onClick={nextQuestion} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8">Next <ArrowRight size={20} className="ml-2" /></Button>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default QuizPage
