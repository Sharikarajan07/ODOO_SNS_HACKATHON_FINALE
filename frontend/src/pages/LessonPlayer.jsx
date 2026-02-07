import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Badge } from '../components/ui'
import { ArrowLeft, ArrowRight, CheckCircle, Menu, X, PlayCircle, FileText, Image as ImageIcon, Lock } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../context/ToastContext'

const LessonPlayer = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [lesson, setLesson] = useState(null)
  const [allLessons, setAllLessons] = useState([])
  const [progressData, setProgressData] = useState([])
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Use a ref to track if component is mounted to prevent state updates on unmount
  const isMounted = useRef(true)

  // Helper to extract YouTube video ID
  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    fetchLesson()
    // On mobile, auto-close sidebar
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [id])

  useEffect(() => {
    // Track time spent (simple implementation)
    const interval = setInterval(() => {
      if (lesson && isMounted.current) {
        updateProgress(false, 10) // Update every 10 seconds
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [lesson])

  const fetchLesson = async () => {
    setLoading(true)

    const timeoutId = setTimeout(() => {
      if (isMounted.current) {
        setLoading(false)
        console.error('Fetch lesson timed out')
        toast.error('Loading timed out - check connection')
      }
    }, 10000)

    try {
      // 1. Fetch main lesson
      const lessonRes = await api.get(`/lessons/${id}`, { timeout: 8000 })

      if (!isMounted.current) return

      setLesson(lessonRes.data)
      setLoading(false)

      clearTimeout(timeoutId)

      // 2. Fetch related data
      try {
        const courseId = lessonRes.data.courseId
        const [courseLessonsRes, progressRes] = await Promise.all([
          api.get(`/lessons/course/${courseId}`, { timeout: 8000 }),
          api.get(`/progress/course/${courseId}`, { timeout: 8000 })
        ])

        if (isMounted.current) {
          setAllLessons(courseLessonsRes.data)
          setProgressData(progressRes.data)
          const lessonProgress = progressRes.data.find(p => p.id === parseInt(id))
          setCompleted(lessonProgress?.completed || false)
        }
      } catch (innerError) {
        console.error('Failed to fetch related data', innerError)
      }
    } catch (error) {
      console.error('Failed to fetch lesson', error)
      toast.error('Failed to load lesson content')
      if (isMounted.current) setLoading(false)
    } finally {
      clearTimeout(timeoutId)
    }
  }

  const updateProgress = async (isCompleted, timeSpent) => {
    try {
      await api.post(`/progress/lesson/${id}`, {
        completed: isCompleted,
        timeSpent
      })
      if (isCompleted && isMounted.current) {
        setCompleted(true)
        // Update local progress state
        setProgressData(prev => prev.map(p =>
          p.id === parseInt(id) ? { ...p, completed: true } : p
        ))
        toast.success('Lesson marked as complete! 🎉')
      }
    } catch (error) {
      console.error('Failed to update progress', error)
    }
  }

  const markComplete = () => {
    updateProgress(true, 0)
  }

  const goToNextLesson = () => {
    const currentIndex = allLessons.findIndex(l => l.id === parseInt(id))
    if (currentIndex < allLessons.length - 1) {
      navigate(`/lesson/${allLessons[currentIndex + 1].id}`)
    } else {
      navigate(`/course/${lesson.courseId}`)
    }
  }

  const goToPreviousLesson = () => {
    const currentIndex = allLessons.findIndex(l => l.id === parseInt(id))
    if (currentIndex > 0) {
      navigate(`/lesson/${allLessons[currentIndex - 1].id}`)
    }
  }

  const VideoPlayer = useMemo(() => {
    if (!lesson || lesson.type !== 'VIDEO') return null

    return (
      <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6 relative group border border-gray-800 shadow-2xl">
        {lesson.contentUrl.includes('youtube') || lesson.contentUrl.includes('youtu.be') ? (
          <>
            <iframe
              src={`https://www.youtube.com/embed/${getYouTubeId(lesson.contentUrl)}?rel=0&modestbranding=1`}
              className="w-full h-full"
              allowFullScreen
              title={lesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </>
        ) : (
          <video controls className="w-full h-full">
            <source src={lesson.contentUrl} type="video/mp4" />
          </video>
        )}
      </div>
    )
  }, [lesson?.id, lesson?.contentUrl])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="text-gray-400">Loading lesson content...</p>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-white">Lesson not found</p>
      </div>
    )
  }

  const currentIndex = allLessons.findIndex(l => l.id === parseInt(id))
  const courseProgress = allLessons.length > 0
    ? (progressData.filter(p => p.completed).length / allLessons.length) * 100
    : 0

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed md:relative z-30 w-80 h-full bg-gray-900 border-r border-gray-800 transition-transform duration-300 ease-in-out flex flex-col`}
      >
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-200 truncate max-w-[200px]" title={lesson.course?.title}>
              {lesson.course?.title || 'Course'}
            </h2>
            <div className="flex items-center mt-1">
              <div className="flex-1 h-1 bg-gray-700 rounded-full w-24 mr-2">
                <div
                  className="h-1 bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${courseProgress}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">{Math.round(courseProgress)}%</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {allLessons.map((l, idx) => {
            const isCurrent = l.id === parseInt(id)
            const isCompleted = progressData.find(p => p.id === l.id)?.completed

            return (
              <div
                key={l.id}
                onClick={() => navigate(`/lesson/${l.id}`)}
                className={`flex items-center p-4 cursor-pointer hover:bg-gray-800 transition-colors border-l-4 ${isCurrent ? 'bg-gray-800 border-indigo-500' : 'border-transparent'
                  }`}
              >
                <div className="mr-3">
                  {isCompleted ? (
                    <CheckCircle size={18} className="text-green-500" />
                  ) : l.type === 'VIDEO' ? (
                    <PlayCircle size={18} className="text-gray-500" />
                  ) : l.type === 'IMAGE' ? (
                    <ImageIcon size={18} className="text-gray-500" />
                  ) : (
                    <FileText size={18} className="text-gray-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isCurrent ? 'text-white' : 'text-gray-400'}`}>
                    {idx + 1}. {l.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{l.duration} min</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="p-4 border-t border-gray-800">
          <Button
            variant="outline"
            className="w-full justify-center border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            onClick={() => navigate(`/course/${lesson.courseId}`)}
          >
            <ArrowLeft size={16} className="mr-2" /> Back to Course
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center p-4 bg-gray-900 border-b border-gray-800">
          <button onClick={() => setSidebarOpen(true)} className="mr-4 text-white">
            <Menu size={24} />
          </button>
          <span className="font-semibold truncate">{lesson.title}</span>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-950 p-6 md:p-10">
          <div className="max-w-4xl mx-auto">
            {/* Header Actions */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl md:text-3xl font-bold">{lesson.title}</h1>
              <div className="flex space-x-3">
                {!completed && (
                  <Button onClick={markComplete} className="bg-green-600 hover:bg-green-700 border-none">
                    <CheckCircle size={18} className="mr-2" /> Mark Complete
                  </Button>
                )}
              </div>
            </div>

            {/* Media Player */}
            {VideoPlayer}

            {lesson.type === 'IMAGE' && (
              <div className="mb-8 rounded-lg overflow-hidden border border-gray-800">
                <img src={lesson.contentUrl} alt={lesson.title} className="w-full object-contain max-h-[600px] bg-black" />
              </div>
            )}

            {lesson.type === 'DOCUMENT' && (
              <div className="bg-white text-black p-4 rounded-lg mb-8 h-[80vh]">
                {lesson.contentUrl.endsWith('.pdf') ? (
                  <iframe src={`https://docs.google.com/viewer?url=${encodeURIComponent(lesson.contentUrl)}&embedded=true`} className="w-full h-full border-none" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <FileText size={48} className="text-gray-400 mb-4" />
                    <p className="mb-4 text-lg">This document cannot be previewed directly.</p>
                    <Button onClick={() => window.open(lesson.contentUrl, '_blank')}>Download / Open</Button>
                  </div>
                )}
              </div>
            )}

            {/* Description & Attachments */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                  <p className="text-gray-400 leading-relaxed">{lesson.description || 'No description provided.'}</p>
                </div>
              </div>

              <div className="space-y-6">
                {lesson.attachments && lesson.attachments.length > 0 && (
                  <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                    <h3 className="font-semibold mb-4 flex items-center">
                      <FileText size={18} className="mr-2 text-indigo-400" /> Resources
                    </h3>
                    <div className="space-y-3">
                      {lesson.attachments.map((att, i) => (
                        <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="block p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition text-sm text-gray-300 hover:text-white truncate">
                          {att.url.split('/').pop() || 'Resource Link'}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Nav */}
            <div className="mt-12 pt-8 border-t border-gray-800 flex justify-between">
              <Button variant="secondary" onClick={goToPreviousLesson} disabled={currentIndex === 0} className="bg-gray-900 border-gray-700 text-white hover:bg-gray-800">
                <ArrowLeft size={16} className="mr-2" /> Previous
              </Button>
              <Button onClick={goToNextLesson} className="bg-indigo-600 hover:bg-indigo-700 text-white border-none">
                {currentIndex === allLessons.length - 1 ? 'Finish Course' : 'Next Lesson'} <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default LessonPlayer

