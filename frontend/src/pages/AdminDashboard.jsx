import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { Button, Card, Badge } from '../components/ui'
import { Plus, Edit, Trash2, BarChart, LayoutGrid, List } from 'lucide-react'
import api from '../services/api'

const AdminDashboard = () => {
  const [courses, setCourses] = useState([])
  const [stats, setStats] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [coursesRes, statsRes] = await Promise.all([
        api.get('/courses'),
        api.get('/reporting/dashboard')
      ])
      setCourses(coursesRes.data)
      setStats(statsRes.data)
    } catch (error) {
      console.error('Failed to fetch data', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteCourse = async (id) => {
    if (!confirm('Are you sure you want to delete this course?')) return

    try {
      await api.delete(`/courses/${id}`)
      setCourses(courses.filter(c => c.id !== id))
    } catch (error) {
      alert('Failed to delete course')
    }
  }

  const togglePublish = async (course) => {
    try {
      await api.patch(`/courses/${course.id}/publish`, {
        published: !course.published
      })
      setCourses(courses.map(c =>
        c.id === course.id ? { ...c, published: !c.published } : c
      ))
    } catch (error) {
      alert('Failed to update course status')
    }
  }

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="text-center py-12">Loading...</div>
      </Layout>
    )
  }

  return (
    <Layout title="Dashboard">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <h3 className="text-gray-500 text-sm font-medium">Total Courses</h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">{stats.totalCourses}</p>
          </Card>
          <Card>
            <h3 className="text-gray-500 text-sm font-medium">Total Learners</h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">{stats.totalLearners}</p>
          </Card>
          <Card>
            <h3 className="text-gray-500 text-sm font-medium">Total Enrollments</h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">{stats.totalEnrollments}</p>
          </Card>
          <Card>
            <h3 className="text-gray-500 text-sm font-medium">Active Enrollments</h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">{stats.activeEnrollments}</p>
          </Card>
        </div>
      )}

      {/* Course Management */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Courses</h2>
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
            >
              <LayoutGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
            >
              <List size={20} />
            </button>
          </div>
          <Button onClick={() => navigate('/admin/course/new')}>
            <Plus size={20} className="inline mr-2" />
            New Course
          </Button>
        </div>
      </div>

      {/* Courses Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              {course.image && (
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              )}
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold">{course.title}</h3>
                {course.published ? (
                  <Badge variant="success">Published</Badge>
                ) : (
                  <Badge variant="warning">Draft</Badge>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {course.description || 'No description'}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{course.lessonCount} lessons</span>
                <span>{course.enrollmentCount} enrolled</span>
                <span>⭐ {course.averageRating.toFixed(1)}</span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="flex-1 text-sm"
                  onClick={() => navigate(`/admin/course/${course.id}/edit`)}
                >
                  <Edit size={16} className="inline mr-1" />
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  className="text-sm"
                  onClick={() => togglePublish(course)}
                >
                  {course.published ? 'Unpublish' : 'Publish'}
                </Button>
                <Button
                  variant="secondary"
                  className="text-sm"
                  onClick={() => navigate(`/admin/reporting/${course.id}`)}
                >
                  <BarChart size={16} />
                </Button>
                <Button
                  variant="danger"
                  className="text-sm"
                  onClick={() => deleteCourse(course.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map(course => (
            <Card key={course.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {course.image && (
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div>
                  <h3 className="font-semibold">{course.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span>{course.lessonCount} lessons</span>
                    <span>{course.enrollmentCount} enrolled</span>
                    <span>⭐ {course.averageRating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {course.published ? (
                  <Badge variant="success">Published</Badge>
                ) : (
                  <Badge variant="warning">Draft</Badge>
                )}
                <Button
                  variant="outline"
                  className="text-sm"
                  onClick={() => navigate(`/admin/course/${course.id}/edit`)}
                >
                  <Edit size={16} />
                </Button>
                <Button
                  variant="secondary"
                  className="text-sm"
                  onClick={() => navigate(`/admin/reporting/${course.id}`)}
                >
                  <BarChart size={16} />
                </Button>
                <Button
                  variant="danger"
                  className="text-sm"
                  onClick={() => deleteCourse(course.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {courses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No courses yet</p>
          <Button onClick={() => navigate('/admin/course/new')}>
            Create Your First Course
          </Button>
        </div>
      )}
    </Layout>
  )
}

export default AdminDashboard
