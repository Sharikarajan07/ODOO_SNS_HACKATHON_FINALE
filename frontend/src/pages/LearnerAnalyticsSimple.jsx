import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import LearnerSidebar from '../components/LearnerSidebar'
import { Menu, TrendingUp, BookOpen, Clock, Award, Target, CheckCircle } from 'lucide-react'
import api from '../services/api'

const LearnerAnalytics = () => {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [enrollmentsRes, progressRes] = await Promise.all([
        api.get('/enrollments/my'),
        api.get('/progress/my')
      ])
      
      setData({
        enrollments: enrollmentsRes.data || [],
        progress: progressRes.data || []
      })
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = () => {
    if (!data) return {
      activeCourses: 0,
      completedCourses: 0,
      totalLessons: 0,
      completedLessons: 0,
      totalTimeSpent: 0,
      completionRate: 0
    }

    const activeCourses = data.enrollments.filter(e => e.status === 'ACTIVE').length
    const completedCourses = data.enrollments.filter(e => e.status === 'COMPLETED').length
    const totalLessons = data.progress.length
    const completedLessons = data.progress.filter(p => p.completed).length
    const totalTimeSpent = data.progress.reduce((sum, p) => sum + (p.timeSpent || 0), 0)
    const completionRate = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

    return {
      activeCourses,
      completedCourses,
      totalLessons,
      completedLessons,
      totalTimeSpent,
      completionRate
    }
  }

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    if (hours > 0) return `${hours}h ${mins}m`
    return `${mins}m`
  }

  const CircularProgress = ({ percentage, size = 120, strokeWidth = 8, color = "#6366f1" }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (percentage / 100) * circumference

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-800">{percentage}%</span>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <LearnerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 md:ml-64">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading analytics...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <LearnerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 md:ml-64">
          <div className="p-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading Analytics</h2>
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={fetchData}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const stats = calculateStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      <LearnerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 md:ml-64">
        <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 px-4 md:px-8 py-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-gray-600 hover:text-gray-900 transition"
            >
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Learning Analytics
              </h1>
              <p className="text-sm text-gray-600 mt-1">Track your progress and achievements</p>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="text-blue-600" size={24} />
                </div>
                <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  Active
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stats.activeCourses}</p>
              <p className="text-sm text-gray-600 font-medium">Active Courses</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Target className="text-green-600" size={24} />
                </div>
                <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  Progress
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stats.completionRate}%</p>
              <p className="text-sm text-gray-600 font-medium">Completion Rate</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-amber-600" size={24} />
                </div>
                <span className="text-sm font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                  Time
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{formatTime(stats.totalTimeSpent)}</p>
              <p className="text-sm text-gray-600 font-medium">Total Time Invested</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Award className="text-purple-600" size={24} />
                </div>
                <span className="text-sm font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                  Done
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stats.completedLessons}</p>
              <p className="text-sm text-gray-600 font-medium">Lessons Completed</p>
            </div>
          </div>

          {/* Main Progress Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Overall Progress Circle */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <TrendingUp className="text-indigo-600 mr-3" size={28} />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Overall Progress</h2>
                  <p className="text-sm text-gray-600">Your learning journey at a glance</p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center justify-around gap-8">
                <div className="text-center">
                  <CircularProgress 
                    percentage={stats.completionRate} 
                    size={160} 
                    strokeWidth={12}
                    color="#6366f1"
                  />
                  <p className="mt-4 text-lg font-semibold text-gray-700">Completion Rate</p>
                </div>
                
                <div className="space-y-4 flex-1 max-w-md">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Lessons Completed</span>
                      <span className="text-lg font-bold text-indigo-600">{stats.completedLessons}/{stats.totalLessons}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${stats.completionRate}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Active Courses</span>
                      <span className="text-2xl font-bold text-green-600">{stats.activeCourses}</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Completed Courses</span>
                      <span className="text-2xl font-bold text-purple-600">{stats.completedCourses}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Status Breakdown */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Course Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="font-medium text-gray-700">Active</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{stats.activeCourses}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="font-medium text-gray-700">Completed</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">{stats.completedCourses}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                    <span className="font-medium text-gray-700">Total</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-700">{data?.enrollments?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Your Courses - Bar Chart Visualization */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <CheckCircle className="text-indigo-600 mr-3" size={28} />
              Your Courses Progress
            </h2>
            
            {data?.enrollments && data.enrollments.length > 0 ? (
              <div className="space-y-6">
                {data.enrollments.map((enrollment, index) => {
                  const colors = [
                    { bg: 'bg-blue-500', light: 'bg-blue-100', text: 'text-blue-600' },
                    { bg: 'bg-purple-500', light: 'bg-purple-100', text: 'text-purple-600' },
                    { bg: 'bg-green-500', light: 'bg-green-100', text: 'text-green-600' },
                    { bg: 'bg-orange-500', light: 'bg-orange-100', text: 'text-orange-600' },
                    { bg: 'bg-pink-500', light: 'bg-pink-100', text: 'text-pink-600' },
                    { bg: 'bg-cyan-500', light: 'bg-cyan-100', text: 'text-cyan-600' }
                  ]
                  const color = colors[index % colors.length]
                  
                  return (
                    <div key={enrollment.id} className="border rounded-lg p-5 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                        <div className="mb-2 sm:mb-0">
                          <h3 className="text-lg font-bold text-gray-900">{enrollment.course?.title || 'Unknown Course'}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`text-xs font-semibold ${color.text} ${color.light} px-2 py-1 rounded-full`}>
                              {enrollment.status}
                            </span>
                            {enrollment.status === 'COMPLETED' && (
                              <CheckCircle size={16} className="text-green-500" />
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-gray-900">{enrollment.progressPercentage}%</span>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div 
                            className={`${color.bg} h-3 rounded-full transition-all duration-1000 ease-out`}
                            style={{ width: `${enrollment.progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No courses enrolled yet</p>
                <button className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                  Explore Courses
                </button>
              </div>
            )}
          </div>

          {/* Learning Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp size={32} />
                <span className="text-4xl font-bold opacity-20">📈</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Keep Going!</h3>
              <p className="text-blue-100">You're making great progress. Stay consistent!</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <Award size={32} />
                <span className="text-4xl font-bold opacity-20">🏆</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Great Work!</h3>
              <p className="text-purple-100">{stats.completedLessons} lessons completed so far</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <Clock size={32} />
                <span className="text-4xl font-bold opacity-20">⏰</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Time Invested</h3>
              <p className="text-green-100">{formatTime(stats.totalTimeSpent)} of focused learning</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LearnerAnalytics
