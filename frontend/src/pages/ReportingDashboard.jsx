import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { Button, Card, Badge } from '../components/ui'
import { ArrowLeft, Download, Filter, Search } from 'lucide-react'
import api from '../services/api'

const ReportingDashboard = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL') // ALL, YET_TO_START, IN_PROGRESS, COMPLETED

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

  // Combine all learners into one list for table
  const allLearners = useMemo(() => {
    if (!data) return []
    const { yetToStart, inProgress, completed } = data.learnerStats

    return [
      ...yetToStart.map(l => ({ ...l, status: 'Not Started', progress: 0 })),
      ...inProgress.map(l => ({ ...l, status: 'In Progress' })), // progress exists on l
      ...completed.map(l => ({ ...l, status: 'Completed', progress: 100 }))
    ]
  }, [data])

  const filteredLearners = allLearners.filter(learner => {
    const matchesSearch = learner.name.toLowerCase().includes(search.toLowerCase()) || learner.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' ||
      (statusFilter === 'YET_TO_START' && learner.status === 'Not Started') ||
      (statusFilter === 'IN_PROGRESS' && learner.status === 'In Progress') ||
      (statusFilter === 'COMPLETED' && learner.status === 'Completed')
    return matchesSearch && matchesStatus
  })

  if (loading) return <Layout><div className="p-8 text-center text-gray-500">Loading Report...</div></Layout>

  if (!data) return <Layout><div className="p-8 text-center text-red-500">Unable to load report</div></Layout>

  const { course } = data

  return (
    <Layout title={`Analytics: ${course.title}`}>
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
          <ArrowLeft size={16} className="inline mr-2" /> Back
        </Button>
        <Button variant="outline" onClick={() => alert("Export feature coming soon!")}>
          <Download size={16} className="mr-2" /> Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white border-l-4 border-indigo-500">
          <p className="text-gray-500 text-xs uppercase font-bold">Total Enrolled</p>
          <p className="text-2xl font-bold mt-1">{course.enrollmentCount}</p>
        </Card>
        <Card className="bg-white border-l-4 border-yellow-500">
          <p className="text-gray-500 text-xs uppercase font-bold">Reviews</p>
          <p className="text-2xl font-bold mt-1">{course.reviewCount}</p>
        </Card>
        <Card className="bg-white border-l-4 border-green-500">
          <p className="text-gray-500 text-xs uppercase font-bold">Rating</p>
          <p className="text-2xl font-bold mt-1">{course.averageRating.toFixed(1)}/5.0</p>
        </Card>
        <Card className="bg-white border-l-4 border-blue-500">
          <p className="text-gray-500 text-xs uppercase font-bold">Lessons</p>
          <p className="text-2xl font-bold mt-1">{course.lessonCount}</p>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card className="overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search student..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex space-x-2 w-full md:w-auto overflow-x-auto">
            {['ALL', 'YET_TO_START', 'IN_PROGRESS', 'COMPLETED'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap ${statusFilter === status ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {status.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolled</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLearners.map(learner => (
                <tr key={learner.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                        {learner.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{learner.name}</div>
                        <div className="text-sm text-gray-500">{learner.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={
                      learner.status === 'Completed' ? 'success' :
                        learner.status === 'In Progress' ? 'primary' : 'warning'
                    }>
                      {learner.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${learner.progress}%` }} />
                      </div>
                      <span className="text-sm text-gray-600">{learner.progress.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(learner.enrolledAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {filteredLearners.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                    No students found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </Layout>
  )
}

export default ReportingDashboard

