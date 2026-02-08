import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Card } from '../components/ui'
import { TrendingUp, Users, BookOpen, Award, Activity, Target, Clock, CheckCircle, BarChart3 } from 'lucide-react'
import api from '../services/api'

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState({
    totalCourses: 0,
    totalLearners: 0,
    totalEnrollments: 0,
    activeEnrollments: 0,
    completedEnrollments: 0,
    totalLessons: 0,
    completedLessons: 0,
    totalProgress: 0,
    avgCompletionRate: 0,
    courses: [],
    enrollmentsByStatus: {},
    learnerActivity: []
  })

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const [coursesRes, learnersRes, enrollmentsRes, progressRes, statsRes] = await Promise.all([
        api.get('/courses'),
        api.get('/users/learners'),
        api.get('/enrollments'),
        api.get('/progress'),
        api.get('/reporting/dashboard')
      ])

      const courses = coursesRes.data || []
      const learners = learnersRes.data || []
      const enrollments = enrollmentsRes.data || []
      const progress = progressRes.data || []
      const stats = statsRes.data || {}

      // Calculate enrollment status distribution
      const enrollmentsByStatus = enrollments.reduce((acc, enrollment) => {
        const status = enrollment.status || 'ACTIVE'
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {})

      // Calculate completion metrics
      const completedLessons = progress.filter(p => p.completed).length
      const avgCompletionRate = enrollments.length > 0
        ? enrollments.reduce((sum, e) => sum + (e.progressPercentage || 0), 0) / enrollments.length
        : 0

      // Get course-wise enrollment counts
      const courseEnrollments = courses.map(course => ({
        courseId: course.id,
        title: course.title,
        enrollmentCount: enrollments.filter(e => e.courseId === course.id).length,
        avgProgress: enrollments
          .filter(e => e.courseId === course.id)
          .reduce((sum, e, _, arr) => sum + (e.progressPercentage || 0) / (arr.length || 1), 0)
      }))

      setAnalytics({
        totalCourses: courses.length,
        totalLearners: learners.length,
        totalEnrollments: stats.totalEnrollments || enrollments.length,
        activeEnrollments: stats.activeEnrollments || enrollmentsByStatus['ACTIVE'] || 0,
        completedEnrollments: enrollmentsByStatus['COMPLETED'] || 0,
        totalLessons: progress.length,
        completedLessons,
        totalProgress: progress.reduce((sum, p) => sum + (p.timeSpent || 0), 0),
        avgCompletionRate,
        courses: courseEnrollments,
        enrollmentsByStatus,
        learnerActivity: learners.slice(0, 5)
      })
    } catch (error) {
      console.error('Failed to fetch analytics', error)
    } finally {
      setLoading(false)
    }
  }

  const completionRate = analytics.totalLessons > 0
    ? Math.round((analytics.completedLessons / analytics.totalLessons) * 100)
    : 0

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    if (hours > 100) {
      return `${hours}h`
    }
    const mins = Math.floor(minutes % 60)
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-500">Loading analytics...</div>
        </div>
      </Layout>
    )
  }

  const statusColors = {
    ACTIVE: { bg: 'bg-blue-500', gradient: 'from-blue-500 to-indigo-600', text: 'text-blue-600' },
    COMPLETED: { bg: 'bg-green-500', gradient: 'from-green-500 to-emerald-600', text: 'text-green-600' },
    DROPPED: { bg: 'bg-red-500', gradient: 'from-red-500 to-rose-600', text: 'text-red-600' }
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Analytics</h1>
          <p className="text-gray-600">Comprehensive overview of platform performance and user engagement</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 border-indigo-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Courses</p>
                <p className="text-4xl font-bold text-indigo-600">{analytics.totalCourses}</p>
                <p className="text-xs text-gray-500 mt-2">Platform-wide</p>
              </div>
              <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen size={32} className="text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Learners</p>
                <p className="text-4xl font-bold text-purple-600">{analytics.totalLearners}</p>
                <p className="text-xs text-gray-500 mt-2">Registered users</p>
              </div>
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Users size={32} className="text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Enrollments</p>
                <p className="text-4xl font-bold text-green-600">{analytics.totalEnrollments}</p>
                <p className="text-xs text-gray-500 mt-2">All time</p>
              </div>
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Activity size={32} className="text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Completion Rate</p>
                <p className="text-4xl font-bold text-amber-600">{Math.round(analytics.avgCompletionRate)}%</p>
                <p className="text-xs text-gray-500 mt-2">Average progress</p>
              </div>
              <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Award size={32} className="text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enrollment Status Pie Chart */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Target size={24} className="mr-2 text-indigo-600" />
              Enrollment Status Distribution
            </h3>
            <div className="flex items-center justify-center py-8">
              <div className="relative w-56 h-56">
                {/* Multi-segment pie chart */}
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="20"
                  />
                  
                  {/* Active enrollments segment */}
                  {analytics.totalEnrollments > 0 && (
                    <>
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="20"
                        strokeDasharray={`${(analytics.activeEnrollments / analytics.totalEnrollments) * 251} 251`}
                        strokeLinecap="round"
                      />
                      {/* Completed enrollments segment */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="20"
                        strokeDasharray={`${(analytics.completedEnrollments / analytics.totalEnrollments) * 251} 251`}
                        strokeDashoffset={-((analytics.activeEnrollments / analytics.totalEnrollments) * 251)}
                        strokeLinecap="round"
                      />
                    </>
                  )}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">{analytics.totalEnrollments}</p>
                    <p className="text-xs text-gray-500 mt-1">Total</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{analytics.activeEnrollments}</p>
                <p className="text-xs text-gray-600 mt-1">Active</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{analytics.completedEnrollments}</p>
                <p className="text-xs text-gray-600 mt-1">Completed</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-600">
                  {analytics.totalEnrollments - analytics.activeEnrollments - analytics.completedEnrollments}
                </p>
                <p className="text-xs text-gray-600 mt-1">Other</p>
              </div>
            </div>
          </Card>

          {/* Lesson Completion Donut Chart */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <CheckCircle size={24} className="mr-2 text-indigo-600" />
              Overall Lesson Completion
            </h3>
            <div className="flex items-center justify-center py-8">
              <div className="relative w-56 h-56">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="20"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="url(#completionGradient)"
                    strokeWidth="20"
                    strokeDasharray={`${completionRate * 2.51} ${251 - completionRate * 2.51}`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="completionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-gray-900">{completionRate}%</p>
                    <p className="text-xs text-gray-500 mt-1">Complete</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{analytics.completedLessons}</p>
                <p className="text-xs text-gray-600 mt-1">Completed</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-600">{analytics.totalLessons - analytics.completedLessons}</p>
                <p className="text-xs text-gray-600 mt-1">In Progress</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Course Performance Bar Chart */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <BarChart3 size={24} className="mr-2 text-indigo-600" />
            Course Enrollment Statistics
          </h3>
          {analytics.courses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No courses available</p>
            </div>
          ) : (
            <div className="mt-4">
              {/* Vertical Bar Chart */}
              <div className="flex items-end justify-around gap-4 h-64 px-4">
                {analytics.courses.slice(0, 6).map((course, index) => {
                  const maxEnrollments = Math.max(...analytics.courses.map(c => c.enrollmentCount))
                  const heightPercentage = maxEnrollments > 0 ? (course.enrollmentCount / maxEnrollments) * 100 : 0
                  
                  const colors = [
                    'from-blue-500 to-indigo-600',
                    'from-purple-500 to-pink-600',
                    'from-green-500 to-emerald-600',
                    'from-orange-500 to-red-600',
                    'from-cyan-500 to-blue-600',
                    'from-violet-500 to-purple-600'
                  ]
                  const bgColors = [
                    'bg-blue-50',
                    'bg-purple-50',
                    'bg-green-50',
                    'bg-orange-50',
                    'bg-cyan-50',
                    'bg-violet-50'
                  ]
                  const color = colors[index % colors.length]
                  const bgColor = bgColors[index % bgColors.length]
                  
                  return (
                    <div key={course.courseId} className="flex-1 flex flex-col items-center group max-w-[150px]">
                      {/* Bar */}
                      <div className="w-full flex flex-col items-center justify-end h-full mb-2">
                        <div className="text-center mb-1">
                          <p className="text-xl font-bold text-gray-800">{course.enrollmentCount}</p>
                          <p className="text-xs text-gray-500">learners</p>
                        </div>
                        <div 
                          className={`w-full rounded-t-lg bg-gradient-to-t ${color} shadow-lg group-hover:shadow-xl transition-all duration-300`}
                          style={{ height: `${heightPercentage}%`, minHeight: '30px' }}
                        >
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {Math.round(course.avgProgress)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Label */}
                      <div className={`w-full ${bgColor} p-3 rounded-lg text-center`}>
                        <p className="text-xs font-semibold text-gray-800 line-clamp-2">
                          {course.title}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {/* Baseline */}
              <div className="h-1 bg-gray-300 rounded mt-0"></div>
              <p className="text-center text-sm text-gray-500 mt-4">
                Enrollment count and average progress (%) per course
              </p>
            </div>
          )}
        </Card>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Activity Horizontal Bar Chart */}
          <Card className="p-6 lg:col-span-2">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <TrendingUp size={24} className="mr-2 text-indigo-600" />
              Top Performing Courses by Completion
            </h3>
            <div className="space-y-4">
              {analytics.courses
                .sort((a, b) => b.avgProgress - a.avgProgress)
                .slice(0, 5)
                .map((course, index) => (
                  <div key={course.courseId}>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-medium text-gray-700 truncate flex-1 mr-4">
                        {index + 1}. {course.title}
                      </span>
                      <span className="font-bold text-indigo-600 whitespace-nowrap">
                        {Math.round(course.avgProgress)}%
                      </span>
                    </div>
                    <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                        style={{ width: `${course.avgProgress || 0}%` }}
                      >
                        {course.avgProgress > 15 && (
                          <span className="text-xs text-white font-medium">
                            {course.enrollmentCount} learners
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          {/* Summary Stats */}
          <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Activity size={24} className="mr-2 text-indigo-600" />
              Quick Stats
            </h3>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Total Learning Time</p>
                <p className="text-3xl font-bold text-indigo-600">{formatTime(analytics.totalProgress)}</p>
                <p className="text-xs text-gray-500 mt-2">Across all learners</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Avg. Lessons per Course</p>
                <p className="text-3xl font-bold text-purple-600">
                  {analytics.totalCourses > 0 ? Math.round(analytics.totalLessons / analytics.totalCourses) : 0}
                </p>
                <p className="text-xs text-gray-500 mt-2">Platform average</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Enrollment Rate</p>
                <p className="text-3xl font-bold text-green-600">
                  {analytics.totalLearners > 0 
                    ? (analytics.totalEnrollments / analytics.totalLearners).toFixed(1)
                    : 0}
                </p>
                <p className="text-xs text-gray-500 mt-2">Courses per learner</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Performance Insights */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Platform Performance Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <Activity size={20} className="text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{analytics.activeEnrollments}</p>
              <p className="text-xs text-gray-500 mt-2">Currently learning</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-green-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">
                {analytics.totalEnrollments > 0 
                  ? Math.round((analytics.completedEnrollments / analytics.totalEnrollments) * 100)
                  : 0}%
              </p>
              <p className="text-xs text-gray-500 mt-2">Course completion</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-purple-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Engagement</p>
                <TrendingUp size={20} className="text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(analytics.avgCompletionRate)}%
              </p>
              <p className="text-xs text-gray-500 mt-2">Average progress</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-amber-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Popularity</p>
                <Award size={20} className="text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-amber-600">
                {analytics.courses.length > 0 
                  ? Math.max(...analytics.courses.map(c => c.enrollmentCount))
                  : 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">Top course enrollments</p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  )
}

export default AdminAnalytics
