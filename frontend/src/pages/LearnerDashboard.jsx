import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { Button, Card, Badge, Progress } from '../components/ui'
import { Book, Trophy, Award, Clock } from 'lucide-react'
import api from '../services/api'

const LearnerDashboard = () => {
  const [enrollments, setEnrollments] = useState([])
  const [allCourses, setAllCourses] = useState([])
  const [stats, setStats] = useState(null)
  const [activeTab, setActiveTab] = useState('my-courses')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [enrollmentsRes, coursesRes, statsRes] = await Promise.all([
        api.get('/enrollments/my'),
        api.get('/courses'),
        api.get('/reporting/learner/dashboard')
      ])
      setEnrollments(enrollmentsRes.data)
      setAllCourses(coursesRes.data)
      setStats(statsRes.data)
    } catch (error) {
      console.error('Failed to fetch data', error)
    } finally {
      setLoading(false)
    }
  }

  const enrollInCourse = async (courseId) => {
    try {
      await api.post('/enrollments', { courseId })
      fetchData()
      alert('Successfully enrolled!')
    } catch (error) {
      alert(error.response?.data?.error || 'Enrollment failed')
    }
  }

  if (loading) {
    return (
      <Layout title="My Learning">
        <div className="text-center py-12">Loading...</div>
      </Layout>
    )
  }

  const enrolledCourseIds = enrollments.map(e => e.course.id)
  const availableCourses = allCourses.filter(c => !enrolledCourseIds.includes(c.id))

  return (
    <Layout title="My Learning">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="flex items-center space-x-4">
            <div className="p-3 bg-primary-100 rounded-full">
              <Book className="text-primary-600" size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Enrolled Courses</p>
              <p className="text-2xl font-bold">{stats.totalEnrollments}</p>
            </div>
          </Card>
          <Card className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Award className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Completed</p>
              <p className="text-2xl font-bold">{stats.completedCourses}</p>
            </div>
          </Card>
          <Card className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Trophy className="text-yellow-600" size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Points</p>
              <p className="text-2xl font-bold">{stats.totalPoints}</p>
            </div>
          </Card>
          <Card className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Award className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Badge</p>
              <p className="text-xl font-bold">{stats.badge}</p>
            </div>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('my-courses')}
          className={`pb-2 px-4 ${activeTab === 'my-courses' ? 'border-b-2 border-primary-600 text-primary-600 font-semibold' : 'text-gray-600'}`}
        >
          My Courses
        </button>
        <button
          onClick={() => setActiveTab('explore')}
          className={`pb-2 px-4 ${activeTab === 'explore' ? 'border-b-2 border-primary-600 text-primary-600 font-semibold' : 'text-gray-600'}`}
        >
          Explore Courses
        </button>
      </div>

      {/* My Courses Tab */}
      {activeTab === 'my-courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map(enrollment => (
            <Card
              key={enrollment.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/course/${enrollment.course.id}`)}
            >
              {enrollment.course.image && (
                <img
                  src={enrollment.course.image}
                  alt={enrollment.course.title}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/600x400?text=Course';
                  }}
                />
              )}
              <h3 className="text-lg font-semibold mb-2">{enrollment.course.title}</h3>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <span>{enrollment.course.lessonCount} lessons</span>
                <span>⭐ {enrollment.course.averageRating.toFixed(1)}</span>
              </div>
              <div className="mb-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{enrollment.progressPercentage.toFixed(0)}%</span>
                </div>
                <Progress value={enrollment.progressPercentage} />
              </div>
              {enrollment.status === 'COMPLETED' && (
                <Badge variant="success" className="mt-2">Completed</Badge>
              )}
            </Card>
          ))}
          {enrollments.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet</p>
              <Button onClick={() => setActiveTab('explore')}>
                Explore Courses
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Explore Courses Tab */}
      {activeTab === 'explore' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableCourses.map(course => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              {course.image && (
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              )}
              <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {course.description || 'No description'}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{course.lessonCount} lessons</span>
                <span>{course.enrollmentCount} enrolled</span>
                <span>⭐ {course.averageRating.toFixed(1)}</span>
                {course.accessRule === 'PAID' && (
                  <Badge variant="warning">${course.price}</Badge>
                )}
              </div>
              <div className="flex space-x-2">
                <Button
                  className="flex-1"
                  onClick={() => enrollInCourse(course.id)}
                >
                  Enroll Now
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/course/${course.id}`)}
                >
                  View
                </Button>
              </div>
            </Card>
          ))}
          {availableCourses.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No more courses available</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}

export default LearnerDashboard
