import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Badge } from '../components/ui'
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import api from '../services/api'

const LessonPlayer = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [allLessons, setAllLessons] = useState([])
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLesson()
  }, [id])

  useEffect(() => {
    // Track time spent (simple implementation)
    const interval = setInterval(() => {
      if (lesson) {
        updateProgress(false, 10) // Update every 10 seconds
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [lesson])

  const fetchLesson = async () => {
    try {
      const [lessonRes, lessonsRes] = await Promise.all([
        api.get(`/lessons/${id}`),
        api.get(`/lessons/course/${id}`).catch(() => ({ data: [] }))
      ])
      
      setLesson(lessonRes.data)
      
      // Fetch all lessons of the course
      const courseLessons = await api.get(`/lessons/course/${lessonRes.data.courseId}`)
      setAllLessons(courseLessons.data)

      // Check if lesson is completed
      const progressRes = await api.get(`/progress/course/${lessonRes.data.courseId}`)
      const lessonProgress = progressRes.data.find(p => p.id === parseInt(id))
      setCompleted(lessonProgress?.completed || false)
    } catch (error) {
      console.error('Failed to fetch lesson', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProgress = async (isCompleted, timeSpent) => {
    try {
      await api.post(`/progress/lesson/${id}`, {
        completed: isCompleted,
        timeSpent
      })
      if (isCompleted) {
        setCompleted(true)
        alert('Lesson marked as complete! 🎉')
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
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-gray-900 rounded-lg p-8 mb-6">
          {/* Content Display */}
          {lesson.type === 'VIDEO' && (
            <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
              {lesson.contentUrl.includes('youtube.com') || lesson.contentUrl.includes('youtu.be') ? (
                <iframe
                  src={lesson.contentUrl.replace('watch?v=', 'embed/')}
                  className="w-full h-full"
                  allowFullScreen
                  title={lesson.title}
                />
              ) : (
                <video controls className="w-full h-full">
                  <source src={lesson.contentUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          )}

          {lesson.type === 'DOCUMENT' && (
            <div className="bg-white text-black p-8 rounded-lg mb-4">
              <iframe
                src={lesson.contentUrl}
                className="w-full h-screen"
                title={lesson.title}
              />
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
