import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import LearnerSidebar from '../components/LearnerSidebar'
import { Card } from '../components/ui'
import { Menu, TrendingUp, BookOpen, Clock, Award, CheckCircle, Target } from 'lucide-react'
import api from '../services/api'

const LearnerAnalytics = () => {
  console.log('LearnerAnalytics component rendering')
  const { user } = useAuth()
  console.log('User from auth context:', user)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState({
    enrollments: [],
    progress: [],
    totalLessons: 0,
    completedLessons: 0,
    totalTimeSpent: 0,
    averageProgress: 0,
    activeCourses: 0,
    completedCourses: 0
  })

  useEffect(() => {
    console.log('useEffect triggered, calling fetchAnalytics')
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      console.log('Starting fetchAnalytics...')
      const [enrollmentsRes, progressRes] = await Promise.all([
        api.get('/enrollments/my'),
        api.get('/progress/my')
      ])

      console.log('API responses received')
      console.log('Enrollments response:', enrollmentsRes)
      console.log('Progress response:', progressRes)

      const enrollments = enrollmentsRes.data || []
      const progress = progressRes.data || []

      console.log('Enrollments data:', enrollments)
      console.log('Progress data:', progress)

      const completedLessons = progress.filter(p => p.completed).length
      const totalTimeSpent = progress.reduce((sum, p) => sum + (p.timeSpent || 0), 0)
      const activeCourses = enrollments.filter(e => e.status === 'ACTIVE').length
      const completedCourses = enrollments.filter(e => e.status === 'COMPLETED').length
      const totalLessons = progress.length
      const averageProgress = enrollments.length > 0
        ? enrollments.reduce((sum, e) => sum + (e.progressPercentage || 0), 0) / enrollments.length
        : 0

      console.log('Calculated stats:', {
        completedLessons,
        totalTimeSpent,
        activeCourses,
        completedCourses,
        totalLessons,
        averageProgress
      })

      setAnalytics({
        enrollments,
        progress,
        totalLessons,
        completedLessons,
        totalTimeSpent,
        averageProgress,
        activeCourses,
        completedCourses
      })
      console.log('Analytics state updated successfully')
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      console.error('Error details:', error.response || error.message)
      alert('Error loading analytics: ' + (error.response?.data?.message || error.message))
    } finally {
      console.log('Setting loading to false')
      setLoading(false)
    }
  }

  const completionRate = analytics.totalLessons > 0
    ? Math.round((analytics.completedLessons / analytics.totalLessons) * 100)
    : 0

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  if (loading) {
    console.log('Rendering loading state')
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <LearnerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 md:ml-64 flex items-center justify-center">
          <div className="text-gray-500">Loading analytics...</div>
        </div>
      </div>
    )
  }

  console.log('Rendering main analytics UI with data:', analytics)
  console.log('Completion rate:', completionRate)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      <LearnerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 md:ml-64 min-h-screen">
        <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 px-4 md:px-8 py-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-gray-600 hover:text-gray-900"
            >
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Learning Analytics</h1>
              <p className="text-sm text-gray-600 mt-1 hidden sm:block">Your comprehensive learning journey dashboard</p>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden group hover:scale-105 transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/50">
                    <BookOpen size={24} className="text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Active</p>
                  </div>
                </div>
                <p className="text-4xl font-black text-gray-900 mb-1">{analytics.activeCourses}</p>
                <p className="text-sm text-gray-600 font-medium">Courses in Progress</p>
              </div>
            </Card>

            <Card className="relative overflow-hidden group hover:scale-105 transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/50">
                    <Target size={24} className="text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Success</p>
                  </div>
                </div>
                <p className="text-4xl font-black text-gray-900 mb-1">{completionRate}%</p>
                <p className="text-sm text-gray-600 font-medium">Completion Rate</p>
              </div>
            </Card>

            <Card className="relative overflow-hidden group hover:scale-105 transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/50">
                    <Clock size={24} className="text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Learning</p>
                  </div>
                </div>
                <p className="text-4xl font-black text-gray-900 mb-1">{formatTime(analytics.totalTimeSpent)}</p>
                <p className="text-sm text-gray-600 font-medium">Total Time Invested</p>
              </div>
            </Card>

            <Card className="relative overflow-hidden group hover:scale-105 transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                    <Award size={24} className="text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Achieved</p>
                  </div>
                </div>
                <p className="text-4xl font-black text-gray-900 mb-1">{analytics.completedLessons}</p>
                <p className="text-sm text-gray-600 font-medium">Lessons Mastered</p>
              </div>
            </Card>
          </div>

          {/* Main Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Overall Progress - Large Radial Chart */}
            <Card className="lg:col-span-2 p-8 bg-gradient-to-br from-white to-indigo-50/30">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                    <TrendingUp size={28} className="mr-3 text-indigo-600" />
                    Your Learning Progress
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Overall completion across all courses</p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center justify-around gap-8">
                {/* Large Radial Progress */}
                <div className="relative w-64 h-64">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                    {/* Background circles */}
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                    <circle cx="50" cy="50" r="35" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                    
                    {/* Progress circle */}
                    <circle
                      cx="50" cy="50" r="45" fill="none"
                      stroke="url(#mainGradient)" strokeWidth="8"
                      strokeDasharray={`${(completionRate / 100) * 283} 283`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                    
                    <defs>
                      <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="50%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-5xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {completionRate}%
                    </p>
                    <p className="text-sm text-gray-600 font-semibold mt-2">Complete</p>
                  </div>
                </div>

                {/* Stats Breakdown */}
                <div className="space-y-4 flex-1">
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                          <CheckCircle size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Completed</p>
                          <p className="text-2xl font-bold text-gray-900">{analytics.completedLessons}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">lessons</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                          <BookOpen size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">In Progress</p>
                          <p className="text-2xl font-bold text-gray-900">{analytics.totalLessons - analytics.completedLessons}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">lessons</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                          <Target size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Total Courses</p>
                          <p className="text-2xl font-bold text-gray-900">{analytics.enrollments.length}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">enrolled</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Course Status Donut */}
            <Card className="p-6 bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <Award size={20} className="mr-2 text-indigo-600" />
                Course Status
              </h3>
              <div className="flex flex-col items-center justify-center h-full">
                <div className="relative w-48 h-48">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="15" />
                    
                    {analytics.enrollments.length > 0 && (
                      <>
                        {/* Active segment */}
                        <circle
                          cx="50" cy="50" r="40" fill="none"
                          stroke="#3b82f6" strokeWidth="15"
                          strokeDasharray={`${(analytics.activeCourses / analytics.enrollments.length) * 251} 251`}
                          strokeLinecap="round"
                        />
                        {/* Completed segment */}
                        <circle
                          cx="50" cy="50" r="40" fill="none"
                          stroke="#10b981" strokeWidth="15"
                          strokeDasharray={`${(analytics.completedCourses / analytics.enrollments.length) * 251} 251`}
                          strokeDashoffset={-((analytics.activeCourses / analytics.enrollments.length) * 251)}
                          strokeLinecap="round"
                        />
                      </>
                    )}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-900">{analytics.enrollments.length}</p>
                      <p className="text-xs text-gray-500 mt-1">Total</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-8 w-full">
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2"></div>
                    <p className="text-2xl font-bold text-blue-600">{analytics.activeCourses}</p>
                    <p className="text-xs text-gray-600 mt-1">Active</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2"></div>
                    <p className="text-2xl font-bold text-green-600">{analytics.completedCourses}</p>
                    <p className="text-xs text-gray-600 mt-1">Completed</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Course-wise Progress - Radial Cards */}
          <Card className="p-8 bg-white">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Individual Course Performance</h3>
                <p className="text-sm text-gray-600 mt-1">Track your progress in each enrolled course</p>
              </div>
            </div>
            
            {analytics.enrollments.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <BookOpen size={64} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No courses enrolled yet</p>
                <p className="text-sm mt-2">Start your learning journey today!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analytics.enrollments.map((enrollment, index) => {
                  const progress = enrollment.progressPercentage || 0
                  const isCompleted = enrollment.status === 'COMPLETED'
                  const isActive = enrollment.status === 'ACTIVE'
                  
                  const colorSchemes = [
                    { gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
                    { gradient: 'from-purple-500 to-pink-600', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
                    { gradient: 'from-green-500 to-emerald-600', bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
                    { gradient: 'from-orange-500 to-red-600', bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
                    { gradient: 'from-cyan-500 to-blue-600', bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200' },
                    { gradient: 'from-rose-500 to-pink-600', bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' }
                  ]
                  const scheme = colorSchemes[index % colorSchemes.length]
                  
                  return (
                    <div
                      key={enrollment.id}
                      className={`relative p-6 rounded-2xl border-2 ${scheme.border} ${scheme.bg} hover:shadow-xl transition-all duration-300 group`}
                    >
                      {/* Status Badge */}
                      {isCompleted && (
                        <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg z-10">
                          <CheckCircle size={24} className="text-white" />
                        </div>
                      )}
                      
                      {/* Radial Progress */}
                      <div className="flex flex-col items-center mb-4">
                        <div className="relative w-32 h-32 mb-4">
                          <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                            {/* Background circle */}
                            <circle
                              cx="50" cy="50" r="40"
                              fill="none" stroke="white"
                              strokeWidth="12"
                            />
                            {/* Progress circle */}
                            <circle
                              cx="50" cy="50" r="40"
                              fill="none"
                              stroke={`url(#grad${index})`}
                              strokeWidth="12"
                              strokeDasharray={`${(progress / 100) * 251} 251`}
                              strokeLinecap="round"
                              className="transition-all duration-1000"
                            />
                            <defs>
                              <linearGradient id={`grad${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" className={scheme.gradient.split(' ')[0].replace('from-', '')} stopColor={
                                  scheme.gradient.includes('blue-500') ? '#3b82f6' :
                                  scheme.gradient.includes('purple-500') ? '#a855f7' :
                                  scheme.gradient.includes('green-500') ? '#22c55e' :
                                  scheme.gradient.includes('orange-500') ? '#f97316' :
                                  scheme.gradient.includes('cyan-500') ? '#06b6d4' :
                                  '#f43f5e'
                                } />
                                <stop offset="100%" className={scheme.gradient.split(' ')[2].replace('to-', '')} stopColor={
                                  scheme.gradient.includes('indigo-600') ? '#4f46e5' :
                                  scheme.gradient.includes('pink-600') ? '#db2777' :
                                  scheme.gradient.includes('emerald-600') ? '#059669' :
                                  scheme.gradient.includes('red-600') ? '#dc2626' :
                                  scheme.gradient.includes('blue-600') ? '#2563eb' :
                                  '#db2777'
                                } />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <p className={`text-3xl font-black ${scheme.text}`}>{progress}%</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Course Title */}
                        <h4 className="text-center font-bold text-gray-900 text-lg mb-2 line-clamp-2 px-2">
                          {enrollment.course?.title}
                        </h4>
                        
                        {/* Status */}
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-green-500' : isActive ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`}></div>
                          <span className={`text-xs font-semibold uppercase tracking-wider ${
                            isCompleted ? 'text-green-600' : isActive ? 'text-blue-600' : 'text-gray-600'
                          }`}>
                            {enrollment.status}
                          </span>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="h-2 bg-white rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${scheme.gradient} rounded-full transition-all duration-1000`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          {/* Performance Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-5 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <TrendingUp size={28} className="text-white" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">Average Progress</p>
                <p className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {Math.round(analytics.averageProgress)}%
                </p>
                <div className="flex items-center space-x-2 mt-4">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-1000"
                      style={{ width: `${analytics.averageProgress}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">Across all enrolled courses</p>
              </div>
            </Card>

            <Card className="relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-600 opacity-5 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <BookOpen size={28} className="text-white" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">Lessons per Course</p>
                <p className="text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                  {analytics.enrollments.length > 0 ? Math.round(analytics.totalLessons / analytics.enrollments.length) : 0}
                </p>
                <div className="flex items-center space-x-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i}
                      className={`flex-1 h-8 rounded ${
                        i < Math.min(5, analytics.enrollments.length > 0 ? Math.round(analytics.totalLessons / analytics.enrollments.length) : 0)
                          ? 'bg-gradient-to-t from-blue-500 to-cyan-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">Average lesson count</p>
              </div>
            </Card>

            <Card className="relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-pink-600 opacity-5 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Award size={28} className="text-white" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">Learning Streak</p>
                <div className="flex items-center space-x-3 mb-2">
                  <p className="text-5xl">{analytics.completedLessons > 0 ? '🔥' : '💤'}</p>
                  <div>
                    <p className="text-3xl font-black bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                      {analytics.completedLessons > 0 ? 'Active' : 'Start'}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Consistency</span>
                    <span className="font-bold">{analytics.completedLessons > 0 ? 'Good' : 'Begin'}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r from-orange-500 to-pink-600 rounded-full ${analytics.completedLessons > 0 ? 'w-3/4' : 'w-0'} transition-all duration-1000`}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">Keep learning daily!</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LearnerAnalytics
