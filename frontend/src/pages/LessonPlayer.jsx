import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Badge } from '../components/ui'
import { ArrowLeft, ArrowRight, CheckCircle, Menu, X, PlayCircle, FileText, Image as ImageIcon, Lock, AlertCircle } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../context/ToastContext'

const LessonPlayer = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [lesson, setLesson] = useState(null)
  const [allLessons, setAllLessons] = useState([])
  const [quiz, setQuiz] = useState(null)
  const [progressData, setProgressData] = useState([])
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Use a ref to track if component is mounted to prevent state updates on unmount
  const isMounted = useRef(true)

  // Helper to extract YouTube video ID
  const getYouTubeId = (url) => {
    if (!url) return null;
    try {
      // Handle different YouTube URL formats
      const patterns = [
        /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,           // youtube.com/watch?v=ID
        /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,                       // youtu.be/ID
        /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,             // youtube.com/embed/ID
        /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,                 // youtube.com/v/ID
        /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,            // youtube.com/shorts/ID
        /^([a-zA-Z0-9_-]{11})$/                                      // Direct video ID
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          console.log('[YOUTUBE ID] Extracted:', match[1], 'from:', url);
          return match[1];
        }
      }
      
      // Fallback: try to extract any 11-character alphanumeric string
      const idMatch = url.match(/([a-zA-Z0-9_-]{11})/);
      if (idMatch) {
        console.log('[YOUTUBE ID] Fallback extracted:', idMatch[1], 'from:', url);
        return idMatch[1];
      }
      
      console.warn('[YOUTUBE ID] Could not extract ID from:', url);
      return null;
    } catch (error) {
      console.error('Error extracting YouTube ID:', error);
      return null;
    }
  }

  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    console.log('[MOUNT] LessonPlayer mounted for lesson ID:', id)
    isMounted.current = true

    fetchLesson()

    // Failsafe: Force stop loading after 20 seconds
    const failsafeTimeout = setTimeout(() => {
      console.error('[FAILSAFE] Forcing loading to stop after 20 seconds')
      if (isMounted.current) {
        setLoading(false)
        if (!lesson) {
          setError('Loading took too long. Please check your network connection and try refreshing.')
        }
      }
    }, 20000)

    // On mobile, auto-close sidebar
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }

    return () => {
      console.log('[UNMOUNT] LessonPlayer unmounting')
      isMounted.current = false
      clearTimeout(failsafeTimeout)
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
    setError(null)

    console.log('[FETCH START] fetchLesson called at', new Date().toLocaleTimeString())
    console.log('[FETCH START] Lesson ID:', id)
    console.log('[FETCH START] API baseURL:', api.defaults.baseURL)

    const timeoutId = setTimeout(() => {
      if (isMounted.current) {
        setLoading(false)
        setError('Request timed out. Please check your connection and backend server.')
        console.error('[TIMEOUT] Fetch lesson timed out after 15 seconds')
        try {
          toast?.error?.('Loading timed out - check connection')
        } catch (e) {
          console.error('[TIMEOUT] Toast not available', e)
        }
      }
    }, 15000) // Increase timeout to 15 seconds

    try {
      // 1. Fetch main lesson
      console.log('[API CALL] Calling GET /api/lessons/' + id)
      const lessonRes = await api.get(`/lessons/${id}`, {
        timeout: 12000,
        validateStatus: function (status) {
          // Accept any status code less than 500
          return status < 500
        }
      })
      console.log('[API RESPONSE] Status:', lessonRes.status)
      console.log('[API RESPONSE] Data:', lessonRes.data)

      if (lessonRes.status === 401) {
        console.warn('[API WARNING] Got 401 but continuing anyway for public lesson')
        // For public lessons, try without auth
        const publicRes = await fetch(`/api/lessons/${id}`)
        if (publicRes.ok) {
          const data = await publicRes.json()
          lessonRes.data = data
          console.log('[API FALLBACK] Got data via fetch:', data)
        } else {
          throw new Error('Lesson not found or not accessible')
        }
      }

      if (!isMounted.current) {
        console.log('[UNMOUNTED] Component unmounted during API call, aborting')
        clearTimeout(timeoutId)
        return
      }

      // Set lesson data and immediately stop loading
      console.log('[SUCCESS] Setting lesson data:', lessonRes.data.title)
      setLesson(lessonRes.data)
      console.log('[SUCCESS] Stopping loading state')
      setLoading(false)
      clearTimeout(timeoutId)
      console.log('[SUCCESS] ✅ Lesson loaded successfully, video should render now!')

      // 2. Fetch related data in background (don't block rendering)
      setTimeout(async () => {
        try {
          const courseId = lessonRes.data.courseId
          console.log('[BACKGROUND] Fetching related data for course', courseId)

          const [courseLessonsRes, progressRes, quizRes] = await Promise.all([
            api.get(`/lessons/course/${courseId}`, { timeout: 8000 }).catch(e => ({ data: [] })),
            api.get(`/progress/course/${courseId}`, { timeout: 8000 }).catch(e => ({ data: [] })),
            api.get(`/quizzes/course/${courseId}`).catch(e => ({ data: null }))
          ])

          if (isMounted.current) {
            setAllLessons(courseLessonsRes.data)
            setProgressData(progressRes.data)
            setQuiz(quizRes.data)
            const lessonProgress = progressRes.data.find(p => p.id === parseInt(id))
            setCompleted(lessonProgress?.completed || false)
            console.log('[BACKGROUND] ✅ Related data loaded')
          }
        } catch (innerError) {
          console.error('[BACKGROUND] Failed to fetch related data', innerError)
          // Don't show error to user, just log it
        }
      }, 100)

    } catch (error) {
      clearTimeout(timeoutId)
      console.error('[ERROR] ❌ Failed to fetch lesson', error)
      console.error('[ERROR] Error name:', error.name)
      console.error('[ERROR] Error message:', error.message)
      console.error('[ERROR] Error stack:', error.stack)
      console.error('[ERROR] Response:', error.response?.data)
      console.error('[ERROR] Status:', error.response?.status)
      console.error('[ERROR] URL:', error.config?.url)

      const errorMsg = error.response?.data?.error || error.message || 'Failed to load lesson'

      try {
        toast?.error?.('Failed to load lesson: ' + errorMsg)
      } catch (e) {
        console.error('[ERROR] Toast not available', e)
      }

      if (isMounted.current) {
        setError(errorMsg)
        setLoading(false)
      }
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
      if (quiz) {
        navigate(`/quiz/${quiz.id}`)
      } else {
        navigate(`/course/${lesson.courseId}`)
      }
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

    const isYouTube = lesson.contentUrl && (lesson.contentUrl.includes('youtube') || lesson.contentUrl.includes('youtu.be'));
    const videoId = isYouTube ? getYouTubeId(lesson.contentUrl) : null;

    console.log('[VIDEO PLAYER] Rendering video:', {
      url: lesson.contentUrl,
      isYouTube,
      videoId
    });

    const openYouTubeLink = () => {
      if (isYouTube && videoId) {
        window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank')
      } else if (lesson.contentUrl) {
        window.open(lesson.contentUrl, '_blank')
      }
    }

    return (
      <div className="w-full">
        <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 shadow-lg flex items-center justify-center">
          {isYouTube ? (
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{lesson.title}</h3>
              <p className="text-gray-600 mb-6">Click the button below to watch this video on YouTube</p>
              <button
                onClick={openYouTubeLink}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-transform"
              >
                Open YouTube Link
              </button>
            </div>
          ) : (
            <video controls className="w-full h-full rounded-lg" preload="metadata">
              <source src={lesson.contentUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </div>
    )
  }, [lesson?.id, lesson?.contentUrl, lesson?.title])

  if (loading && !lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4 p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="text-gray-600">Loading lesson content... ({new Date().toLocaleTimeString()})</p>
        <p className="text-gray-500 text-sm">Lesson ID: {id}</p>
        <div className="mt-6 space-y-2 text-center">
          <p className="text-gray-600 text-xs">If stuck loading:</p>
          <div className="space-x-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Refresh Page
            </button>
            <button
              onClick={() => {
                console.log('=== DIAGNOSTIC INFO ===')
                console.log('Lesson ID:', id)
                console.log('Has token:', !!localStorage.getItem('token'))
                console.log('Has user:', !!localStorage.getItem('user'))
                console.log('API baseURL:', api.defaults.baseURL)
                alert('Check console (F12) for diagnostic info')
                fetchLesson()
              }}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Retry Load
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <p className="text-gray-900 text-xl mb-2">Error Loading Lesson</p>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={() => window.location.reload()} variant="primary">
          Retry
        </Button>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-900">Lesson not found</p>
      </div>
    )
  }

  const currentIndex = allLessons.findIndex(l => l.id === parseInt(id))
  const courseProgress = allLessons.length > 0
    ? (progressData.filter(p => p.completed).length / allLessons.length) * 100
    : 0

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed md:relative z-30 w-80 h-full bg-gray-50 border-r border-gray-200 transition-transform duration-300 ease-in-out flex flex-col shadow-lg`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900 truncate max-w-[200px]" title={lesson.course?.title}>
              {lesson.course?.title || 'Course'}
            </h2>
            <div className="flex items-center mt-1">
              <div className="flex-1 h-1 bg-gray-200 rounded-full w-24 mr-2">
                <div
                  className="h-1 bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${courseProgress}%` }}
                />
              </div>
              <span className="text-xs text-gray-600">{Math.round(courseProgress)}%</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-600 hover:text-gray-900">
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
                className={`flex items-center p-4 cursor-pointer hover:bg-gray-100 transition-colors border-l-4 ${isCurrent ? 'bg-indigo-50 border-indigo-500' : 'border-transparent'
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
                  <p className={`text-sm font-medium truncate ${isCurrent ? 'text-gray-900' : 'text-gray-700'}`}>
                    {idx + 1}. {l.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{l.duration} min</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="p-4 border-t border-gray-200">
          <Button
            variant="outline"
            className="w-full justify-center"
            onClick={() => navigate(`/course/${lesson.courseId}`)}
          >
            <ArrowLeft size={16} className="mr-2" /> Back to Course
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center p-4 bg-white border-b border-gray-200">
          <button onClick={() => setSidebarOpen(true)} className="mr-4 text-gray-900">
            <Menu size={24} />
          </button>
          <span className="font-semibold truncate text-gray-900">{lesson.title}</span>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-10">
          <div className="max-w-4xl mx-auto">
            {/* Header Actions */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{lesson.title}</h1>
              <div className="flex space-x-3">
                {!completed && (
                  <Button onClick={markComplete} className="bg-green-600 hover:bg-green-700 border-none">
                    <CheckCircle size={18} className="mr-2" /> Mark Complete
                  </Button>
                )}
              </div>
            </div>

            {/* Media Player */}
            <div className="mb-6">
              {VideoPlayer}
            </div>

            {lesson.type === 'IMAGE' && (
              <div className="mb-8 rounded-lg overflow-hidden border border-gray-200 shadow-lg">
                <img src={lesson.contentUrl} alt={lesson.title} className="w-full object-contain max-h-[600px] bg-white" />
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{lesson.description || 'No description provided.'}</p>
                </div>
              </div>

              <div className="space-y-6">
                {lesson.attachments && lesson.attachments.length > 0 && (
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="font-semibold mb-4 flex items-center text-gray-900">
                      <FileText size={18} className="mr-2 text-indigo-600" /> Resources
                    </h3>
                    <div className="space-y-3">
                      {lesson.attachments.map((att, i) => (
                        <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-sm text-gray-700 hover:text-gray-900 truncate border border-gray-200">
                          {att.url.split('/').pop() || 'Resource Link'}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Nav */}
            <div className="mt-12 pt-8 border-t border-gray-200 flex justify-between">
              <Button variant="secondary" onClick={goToPreviousLesson} disabled={currentIndex === 0}>
                <ArrowLeft size={16} className="mr-2" /> Previous
              </Button>
              <Button onClick={goToNextLesson}>
                {currentIndex === allLessons.length - 1 ? (quiz ? 'Take Quiz' : 'Finish Course') : 'Next Lesson'} <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default LessonPlayer

