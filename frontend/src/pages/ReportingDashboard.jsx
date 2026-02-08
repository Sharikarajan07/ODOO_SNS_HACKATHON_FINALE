import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Users, Clock, CheckCircle, Search, Filter } from 'lucide-react'
import Layout from '../components/Layout'
import { Button, Input, Card, Badge, Select } from '../components/ui'
import api from '../services/api'
import { useToast } from '../context/ToastContext'

const ReportingDashboard = () => {
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)

  // Filter State
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Column Visibility
  const [visibleColumns, setVisibleColumns] = useState({
    srNo: true,
    courseName: true,
    participantName: true,
    enrolledDate: true,
    startDate: true,
    timeSpent: true,
    completion: true,
    completedDate: true,
    status: true
  })
  const [showColumnPanel, setShowColumnPanel] = useState(false)

  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    if (selectedCourseId) {
      fetchReportData(selectedCourseId)
    }
  }, [selectedCourseId])

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses')
      setCourses(response.data)
      if (response.data.length > 0) {
        setSelectedCourseId(response.data[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch courses')
    }
  }

  const fetchReportData = async (courseId) => {
    setLoading(true)
    try {
      const response = await api.get(`/reporting/course/${courseId}`)
      setReportData(response.data)
    } catch (error) {
      console.error('Failed to fetch report')
      toast.error('Failed to load report data')
    } finally {
      setLoading(false)
    }
  }

  const toggleColumn = (col) => {
    setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }))
  }

  // Filter learners based on status
  const filteredLearners = reportData?.learners?.filter(l => {
    if (statusFilter === 'ALL') return true
    return l.status === statusFilter
  }) || []

  // Overview Stats
  const stats = {
    total: reportData?.learners?.length || 0,
    yetToStart: reportData?.learners?.filter(l => l.status === 'Yet to Start').length || 0,
    inProgress: reportData?.learners?.filter(l => l.status === 'In Progress').length || 0,
    completed: reportData?.learners?.filter(l => l.status === 'Completed').length || 0,
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Layout title="Reporting Dashboard">

      {/* Course Selector */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label className="font-medium text-gray-700">Select Course:</label>
          <select
            className="border rounded-lg px-3 py-2 min-w-[300px]"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
          >
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
        </div>

        <Button variant="outline" onClick={() => setShowColumnPanel(!showColumnPanel)}>
          <Filter size={16} className="mr-2" /> Columns
        </Button>
      </div>

      {/* Show/Hide Columns Panel */}
      {showColumnPanel && (
        <Card className="mb-6 p-4">
          <h4 className="font-semibold mb-3">Customize Columns</h4>
          <div className="flex flex-wrap gap-4">
            {Object.keys(visibleColumns).map(col => (
              <label key={col} className="flex items-center space-x-2 capitalize cursor-pointer">
                <input
                  type="checkbox"
                  checked={visibleColumns[col]}
                  onChange={() => toggleColumn(col)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>{col.replace(/([A-Z])/g, ' $1').trim()}</span>
              </label>
            ))}
          </div>
        </Card>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card
          className={`cursor-pointer transition-all ${statusFilter === 'ALL' ? 'ring-2 ring-indigo-500' : ''}`}
          onClick={() => setStatusFilter('ALL')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Participants</p>
              <h3 className="text-2xl font-bold bg-white-50">{stats.total}</h3>
            </div>
            <div className="p-3 bg-gray-100 rounded-full text-gray-600"><Users size={20} /></div>
          </div>
        </Card>
        <Card
          className={`cursor-pointer transition-all ${statusFilter === 'Yet to Start' ? 'ring-2 ring-yellow-500' : ''}`}
          onClick={() => setStatusFilter('Yet to Start')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Yet to Start</p>
              <h3 className="text-2xl font-bold text-yellow-600">{stats.yetToStart}</h3>
            </div>
            <div className="p-3 bg-yellow-50 rounded-full text-yellow-600"><Clock size={20} /></div>
          </div>
        </Card>
        <Card
          className={`cursor-pointer transition-all ${statusFilter === 'In Progress' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setStatusFilter('In Progress')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <h3 className="text-2xl font-bold text-blue-600">{stats.inProgress}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-full text-blue-600"><BarChart size={20} /></div>
          </div>
        </Card>
        <Card
          className={`cursor-pointer transition-all ${statusFilter === 'Completed' ? 'ring-2 ring-green-500' : ''}`}
          onClick={() => setStatusFilter('Completed')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <h3 className="text-2xl font-bold text-green-600">{stats.completed}</h3>
            </div>
            <div className="p-3 bg-green-50 rounded-full text-green-600"><CheckCircle size={20} /></div>
          </div>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                {visibleColumns.srNo && <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Sr No</th>}
                {visibleColumns.courseName && <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Course</th>}
                {visibleColumns.participantName && <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Name</th>}
                {visibleColumns.enrolledDate && <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Enrolled</th>}
                {visibleColumns.startDate && <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Start Date</th>}
                {visibleColumns.timeSpent && <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Time Spent</th>}
                {visibleColumns.completion && <th className="p-4 text-xs font-semibold text-gray-500 uppercase">%</th>}
                {visibleColumns.completedDate && <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Completed Date</th>}
                {visibleColumns.status && <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Status</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="9" className="p-8 text-center text-gray-500">Loading data...</td></tr>
              ) : filteredLearners.length === 0 ? (
                <tr><td colSpan="9" className="p-8 text-center text-gray-500">No learners found for this filter.</td></tr>
              ) : (
                filteredLearners.map((learner, idx) => (
                  <tr key={learner.id} className="hover:bg-gray-50">
                    {visibleColumns.srNo && <td className="p-4 text-sm text-gray-600">{idx + 1}</td>}
                    {visibleColumns.courseName && <td className="p-4 text-sm font-medium text-gray-900">{reportData.course.title}</td>}
                    {visibleColumns.participantName && (
                      <td className="p-4 text-sm">
                        <div className="font-medium text-gray-900">{learner.name}</div>
                        <div className="text-xs text-gray-500">{learner.email}</div>
                      </td>
                    )}
                    {visibleColumns.enrolledDate && <td className="p-4 text-sm text-gray-600">{formatDate(learner.enrolledAt)}</td>}
                    {visibleColumns.startDate && <td className="p-4 text-sm text-gray-600">{formatDate(learner.startDate)}</td>}
                    {visibleColumns.timeSpent && <td className="p-4 text-sm text-gray-600">{learner.timeSpent}</td>}
                    {visibleColumns.completion && (
                      <td className="p-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-gray-200 rounded-full h-1.5">
                            <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${learner.progress}%` }}></div>
                          </div>
                          <span className="text-xs text-gray-600">{Math.round(learner.progress)}%</span>
                        </div>
                      </td>
                    )}
                    {visibleColumns.completedDate && <td className="p-4 text-sm text-gray-600">{formatDate(learner.completedAt)}</td>}
                    {visibleColumns.status && (
                      <td className="p-4 text-sm">
                        <Badge variant={
                          learner.status === 'Completed' ? 'success' :
                            learner.status === 'In Progress' ? 'primary' : 'warning'
                        }>
                          {learner.status}
                        </Badge>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </Layout>
  )
}

export default ReportingDashboard
