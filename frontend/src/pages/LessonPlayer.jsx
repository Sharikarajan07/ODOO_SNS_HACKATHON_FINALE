import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Badge } from '../components/ui'
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../context/ToastContext'

const LessonPlayer = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [lesson, setLesson] = useState(null)
  const [allLessons, setAllLessons] = useState([])
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(true)

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
  }, [id])

  useEffect(() => {
    // Track time spent (simple implementation)
    const interval = setInterval(() => {
      if (lesson && isMounted.current) {
        updateProgress(false, 10) // Update every 10 seconds
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [lesson]) // Ideally should depend on ID, not full lesson object to avoid re-renders if lesson changes

  const fetchLesson = async () => {
    setLoading(true)
    try {
      const lessonRes = await api.get(`/lessons/${id}`)

      if (!isMounted.current) return

      setLesson(lessonRes.data)

      try {
        const courseId = lessonRes.data.courseId
        // Fetch all lessons of the course
        const [courseLessonsRes, progressRes] = await Promise.all([
          api.get(`/lessons/course/${courseId}`),
          api.get(`/progress/course/${courseId}`)
        ])

        if (isMounted.current) {
          setAllLessons(courseLessonsRes.data)
          const lessonProgress = progressRes.data.find(p => p.id === parseInt(id))
          setCompleted(lessonProgress?.completed || false)
        }
      } catch (innerError) {
        console.error('Failed to fetch related data', innerError)
      }
    } catch (error) {
      console.error('Failed to fetch lesson', error)
      // If lesson not found, we might want to handle it (loading becomes false, lesson is null -> shows "Lesson not found")
    } finally {
      if (isMounted.current) setLoading(false)
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
      // Last lesson - go back to course
      navigate(`/course/${lesson.courseId}`)
    }
  }

  const goToPreviousLesson = () => {
    const currentIndex = allLessons.findIndex(l => l.id === parseInt(id))
    if (currentIndex > 0) {
      navigate(`/lesson/${allLessons[currentIndex - 1].id}`)
    }
  }

  // Memoize the video player to prevent re-renders on every tick
  const VideoPlayer = useMemo(() => {
    if (!lesson || lesson.type !== 'VIDEO') return null

    return (
      <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4 relative group">
        {lesson.contentUrl.includes('youtube') || lesson.contentUrl.includes('youtu.be') ? (
          <>
            <iframe
              src={`https://www.youtube.com/embed/${getYouTubeId(lesson.contentUrl)}?rel=0&modestbranding=1`}
              className="w-full h-full"
              allowFullScreen
              title={lesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <Button
                variant="outline"
                size="sm"
                className="bg-black/50 text-white border-white/50 pointer-events-auto"
                onClick={() => window.open(lesson.contentUrl, '_blank')}
              >
                Watch on YouTube ↗
              </Button>
            </div>
          </>
        ) : (
          <video controls className="w-full h-full">
            <source src={lesson.contentUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    )
  }, [lesson?.id, lesson?.contentUrl]) // Only re-render if ID or URL changes

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Lesson not found</p>
      </div>
    )
  }

  const currentIndex = allLessons.findIndex(l => l.id === parseInt(id))
  const hasNext = currentIndex < allLessons.length - 1
  const hasPrevious = currentIndex > 0

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="secondary"
              onClick={() => navigate(`/course/${lesson.course.id}`)}
            >
              <ArrowLeft size={16} className="inline mr-2" />
              Back to Course
            </Button>
            <div>
              <p className="text-gray-400 text-sm">{lesson.course.title}</p>
              <h1 className="text-xl font-semibold">{lesson.title}</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant={completed ? 'success' : 'default'}>
              {completed ? 'Completed' : 'In Progress'}
            </Badge>
            {!completed && (
              <Button onClick={markComplete}>
                <CheckCircle size={16} className="inline mr-2" />
                Mark Complete
              </Button>
            )}
            {lesson.allowDownload && (
              <Button
                variant="outline"
                onClick={() => window.open(lesson.contentUrl, '_blank')}
                className="ml-2"
              >
                Download
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-gray-900 rounded-lg p-8 mb-6">
          {/* Content Display */}
          {VideoPlayer}

          {lesson.type === 'VIDEO' && (lesson.contentUrl.includes('youtube') || lesson.contentUrl.includes('youtu.be')) && (
            <div className="mb-4 text-center">
              <p className="text-sm text-gray-400">
                Video not playing? <a href={lesson.contentUrl} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">Watch directly on YouTube</a>
              </p>
            </div>
          )}

          {lesson.type === 'DOCUMENT' && (
            <div className="bg-white text-black p-8 rounded-lg mb-4">
              {lesson.contentUrl.endsWith('.pdf') ? (
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(lesson.contentUrl)}&embedded=true`}
                  className="w-full h-screen"
                  title={lesson.title}
                  onError={(e) => console.log("Iframe error:", e)}
                />
              ) : (
                <div className="text-center py-20">
                  <p className="text-xl mb-4">This document cannot be previewed directly.</p>
                  <Button onClick={() => window.open(lesson.contentUrl, '_blank')}>
                    Open Document
                  </Button>
                </div>
              )}
            </div>
          )}

          {lesson.type === 'IMAGE' && (
            <div className="mb-4">
              <img
                src={lesson.contentUrl}
                alt={lesson.title}
                className="w-full rounded-lg"
              />
            </div>
          )}

          {/* Description */}
          {lesson.description && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">About this lesson</h2>
              <p className="text-gray-300">{lesson.description}</p>
            </div>
          )}

          {/* Attachments */}
          {lesson.attachments && lesson.attachments.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Attachments</h2>
              <div className="space-y-2">
                {lesson.attachments.map((attachment, index) => (
                  <a
                    key={index}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
                  >
                    <Badge className="mr-2">{attachment.type}</Badge>
                    {attachment.url}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={goToPreviousLesson}
            disabled={!hasPrevious}
          >
            <ArrowLeft size={16} className="inline mr-2" />
            Previous Lesson
          </Button>

          <div className="text-gray-400">
            Lesson {currentIndex + 1} of {allLessons.length}
          </div>

          <Button
            onClick={goToNextLesson}
            disabled={!hasNext && !completed}
          >
            {hasNext ? 'Next Lesson' : 'Back to Course'}
            <ArrowRight size={16} className="inline ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default LessonPlayer
