import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { Button, Card, Badge, Progress } from '../components/ui'
import { ArrowLeft, Play, CheckCircle, Circle, Star } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

const CourseDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [enrollment, setEnrollment] = useState(null)
  const [progress, setProgress] = useState([])
  const [reviews, setReviews] = useState([])
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourseDetails()
  }, [id])

  const fetchCourseDetails = async () => {
    setLoading(true)

    // Force timeout after 10 seconds to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoading(false)
        toast.error('Loading timed out - check connection')
      }
    }, 10000)

    try {
      const [courseRes, enrollmentRes, progressRes, reviewsRes] = await Promise.all([
        api.get(`/courses/${id}`, { timeout: 8000 }),
        api.get(`/enrollments/${id}`, { timeout: 8000 }).catch(() => ({ data: null })),
        api.get(`/progress/course/${id}`, { timeout: 8000 }).catch(() => ({ data: [] })),
        api.get(`/reviews/course/${id}`, { timeout: 8000 })
      ])

      // Clear timeout since we succeeded
      clearTimeout(timeoutId)

      setCourse(courseRes.data)
      setEnrollment(enrollmentRes.data)
      setProgress(progressRes.data)
      setReviews(reviewsRes.data)
    } catch (error) {
      console.error('Failed to fetch course details', error)
      toast.error('Failed to load course details')
    } finally {
      clearTimeout(timeoutId)
      setLoading(false)
    }
  }

  const enrollInCourse = async () => {
    try {
      await api.post('/enrollments', { courseId: parseInt(id) })
      fetchCourseDetails()
      toast.success('Successfully enrolled!')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Enrollment failed')
    }
  }

  const submitReview = async () => {
    try {
      await api.post('/reviews', {
        courseId: parseInt(id),
        rating: newReview.rating,
        comment: newReview.comment
      })
      fetchCourseDetails()
      setNewReview({ rating: 5, comment: '' })
      toast.success('Review submitted!')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit review')
    }
  }

  const startLesson = (lessonId) => {
    navigate(`/lesson/${lessonId}`)
  }

  const handleBack = () => {
    if (user?.role === 'ADMIN') {
      navigate('/admin/dashboard')
    } else {
      navigate('/learner/dashboard')
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading...</div>
      </Layout>
    )
  }

  if (!course) {
    return (
      <Layout>
        <div className="text-center py-12 text-red-600">Course not found</div>
      </Layout>
    )
  }

  // Use backend's progress percentage which now includes quizzes
  const progressPercentage = enrollment ? enrollment.progressPercentage : 0
  const completedLessons = progress.filter(p => p.completed).length

  return (
    <Layout>
      <div className="mb-6">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft size={16} className="inline mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Header */}
          <Card>
            {course.image && (
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-64 object-cover rounded-lg mb-4"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/800x400?text=Course+Image';
                }}
              />
            )}
            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
            <p className="text-gray-600 mb-4">{course.description}</p>
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center">
                <Star size={20} className="text-yellow-500 fill-current" />
                <span className="ml-1 font-semibold">{course.averageRating.toFixed(1)}</span>
              </div>
              <span className="text-gray-500">{course.enrollmentCount} enrolled</span>
              <span className="text-gray-500">{course.lessons.length} lessons</span>
              {course.accessRule === 'PAID' && (
                <Badge variant="warning" className="text-lg">
                  ${course.price}
                </Badge>
              )}
            </div>
            {course.tags && course.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag, index) => (
                  <Badge key={index}>{tag}</Badge>
                ))}
              </div>
            )}
          </Card>

          {/* Lessons */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Course Content</h2>

              {/* Lesson Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search lessons..."
                  className="pl-3 pr-8 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  onChange={(e) => {
                    // Simple local filter for now
                    const query = e.target.value.toLowerCase();
                    const lessonDivs = document.querySelectorAll('.lesson-item');
                    lessonDivs.forEach(div => {
                      const title = div.getAttribute('data-title').toLowerCase();
                      if (title.includes(query)) {
                        div.style.display = 'flex';
                      } else {
                        div.style.display = 'none';
                      }
                    });
                  }}
                />
              </div>
            </div>

            {enrollment && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Your Progress</span>
                  <span className="font-semibold">{progressPercentage.toFixed(0)}%</span>
                </div>
                <Progress value={progressPercentage} />
              </div>
            )}
            <div className="space-y-2">
              {course.lessons.map((lesson, index) => {
                const lessonProgress = progress.find(p => p.lessonId === lesson.id)
                const isCompleted = lessonProgress?.completed || false

                return (
                  <div
                    key={lesson.id}
                    className="lesson-item flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => enrollment && startLesson(lesson.id)}
                    data-title={lesson.title}
                  >
                    <div className="flex items-center space-x-3">
                      {isCompleted ? (
                        <CheckCircle className="text-green-600" size={20} />
                      ) : (
                        <Circle className="text-gray-400" size={20} />
                      )}
                      <div>
                        <p className="font-medium">
                          {index + 1}. {lesson.title}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-1">{lesson.description}</p>
                      </div>
                    </div>
                    <Badge variant="primary">{lesson.type}</Badge>
                  </div>
                )
              })}
              {course.lessons.length === 0 && <p className="text-gray-500 italic">No lessons added yet.</p>}
            </div>
          </Card>

          {/* Reviews */}
          <Card>
            <h2 className="text-2xl font-bold mb-4">Reviews</h2>

            {enrollment && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Leave a Review</h3>
                <div className="flex items-center space-x-2 mb-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <Star
                      key={rating}
                      size={24}
                      className={`cursor-pointer ${rating <= newReview.rating
                        ? 'text-yellow-500 fill-current'
                        : 'text-gray-300'
                        }`}
                      onClick={() => setNewReview({ ...newReview, rating })}
                    />
                  ))}
                </div>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Share your experience..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                  rows="3"
                />
                <Button onClick={submitReview}>Submit Review</Button>
              </div>
            )}

            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{review.user.name}</p>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {reviews.length === 0 && (
                <p className="text-gray-400">No reviews yet</p>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            {!enrollment ? (
              <>
                <h3 className="text-xl font-bold mb-4">Ready to start learning?</h3>
                {course.accessRule === 'PAID' ? (
                  <Button className="w-full" onClick={enrollInCourse}>
                    Buy Course for ${course.price}
                  </Button>
                ) : (
                  <Button className="w-full" onClick={enrollInCourse}>
                    Enroll for Free
                  </Button>
                )}
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-4">Your Progress</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Completion</p>
                    <p className="text-3xl font-bold text-primary-600">
                      {progressPercentage.toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Lessons Completed</p>
                    <p className="text-xl font-semibold">
                      {completedLessons} / {course.lessons.length}
                    </p>
                  </div>
                  {enrollment.status === 'COMPLETED' && (
                    <Badge variant="success" className="w-full text-center">
                      Course Completed! 🎉
                    </Badge>
                  )}
                  {course.quizzes && course.quizzes.length > 0 && (
                    <Button
                      className="w-full"
                      onClick={() => navigate(`/quiz/${course.quizzes[0].id}`)}
                    >
                      Take Quiz
                    </Button>
                  )}
                  {enrollment.status !== 'COMPLETED' && completedLessons === course.lessons.length && (
                    <Button
                      variant="success"
                      className="w-full mt-2"
                      onClick={() => {
                        api.patch(`/enrollments/${id}/complete`)
                          .then(() => fetchCourseDetails())
                          .catch(() => toast.error('Failed to complete course'))
                      }}
                    >
                      Complete Course
                    </Button>
                  )}
                </div>
              </>
            )}
          </Card>

          {enrollment && (
            <Card>
              <h3 className="font-semibold mb-2">Quick Actions</h3>
              <div className="space-y-2">
                {course.lessons.length > 0 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => startLesson(course.lessons[0].id)}
                  >
                    <Play size={16} className="inline mr-2" />
                    {completedLessons === 0 ? 'Start Course' : 'Continue Learning'}
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default CourseDetail
