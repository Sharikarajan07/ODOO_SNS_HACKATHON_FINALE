import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { Button, Card, Badge } from '../components/ui'
import { ArrowLeft } from 'lucide-react'
import api from '../services/api'

const ReportingDashboard = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReport()
  }, [courseId])

  const fetchReport = async () => {
    try {
      const response = await api.get(`/reporting/course/${courseId}`)
      setData(response.data)
    } catch (error) {
      console.error('Failed to fetch report', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout title="Course Analytics">
        <div className="text-center py-12">Loading...</div>
      </Layout>
    )
  }

  if (!data) {
    return (
      <Layout title="Course Analytics">
        <div className="text-center py-12 text-red-600">Failed to load analytics</div>
      </Layout>
    )
  }

  const { course, learnerStats } = data

  return (
    <Layout title="Course Analytics">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
          <ArrowLeft size={16} className="inline mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Course Overview */}
      <Card className="mb-8">
        <h2 className="text-2xl font-bold mb-4">{course.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-gray-500 text-sm">Lessons</p>
            <p className="text-2xl font-bold text-primary-600">{course.lessonCount}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Enrollments</p>
            <p className="text-2xl font-bold text-primary-600">{course.enrollmentCount}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Reviews</p>
            <p className="text-2xl font-bold text-primary-600">{course.reviewCount}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Average Rating</p>
            <p className="text-2xl font-bold text-primary-600">⭐ {course.averageRating.toFixed(1)}</p>
          </div>
        </div>
      </Card>

      {/* Learner Status Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Yet to Start */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">
            Yet to Start
            <Badge variant="warning" className="ml-2">{learnerStats.yetToStart.length}</Badge>
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {learnerStats.yetToStart.map(learner => (
              <div key={learner.id} className="p-3 bg-gray-50 rounded">
                <p className="font-medium text-sm">{learner.name}</p>
                <p className="text-xs text-gray-600">{learner.email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Enrolled: {new Date(learner.enrolledAt).toLocaleDateString()}
                </p>
              </div>
            ))}
            {learnerStats.yetToStart.length === 0 && (
              <p className="text-gray-400 text-sm">No learners yet</p>
            )}
          </div>
        </Card>

        {/* In Progress */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">
            In Progress
            <Badge variant="primary" className="ml-2">{learnerStats.inProgress.length}</Badge>
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {learnerStats.inProgress.map(learner => (
              <div key={learner.id} className="p-3 bg-blue-50 rounded">
                <p className="font-medium text-sm">{learner.name}</p>
                <p className="text-xs text-gray-600">{learner.email}</p>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span className="font-medium">{learner.progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${learner.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {learnerStats.inProgress.length === 0 && (
              <p className="text-gray-400 text-sm">No learners yet</p>
            )}
          </div>
        </Card>

        {/* Completed */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">
            Completed
            <Badge variant="success" className="ml-2">{learnerStats.completed.length}</Badge>
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {learnerStats.completed.map(learner => (
              <div key={learner.id} className="p-3 bg-green-50 rounded">
                <p className="font-medium text-sm">{learner.name}</p>
                <p className="text-xs text-gray-600">{learner.email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Completed: {new Date(learner.completedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
            {learnerStats.completed.length === 0 && (
              <p className="text-gray-400 text-sm">No learners yet</p>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  )
}

export default ReportingDashboard
