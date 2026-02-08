import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LearnerSidebar from '../components/LearnerSidebar'
import { Button, Card, Badge, Progress } from '../components/ui'
import { Book, Trophy, Award, Clock, Menu } from 'lucide-react'
import api from '../services/api'

const LearnerDashboard = () => {
  const [enrollments, setEnrollments] = useState([])
  const [allCourses, setAllCourses] = useState([])
  const [stats, setStats] = useState(null)
  const [activeTab, setActiveTab] = useState('my-courses')
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 flex">
        <LearnerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 md:ml-64 p-8">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-400 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
            </div>
            <p className="mt-6 text-gray-600 font-medium animate-pulse">Loading your learning journey...</p>
          </div>
        </div>
      </div>
    )
  }

  // Filter courses based on search
  const filteredEnrollments = enrollments.filter(e =>
    e.course.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const enrolledCourseIds = enrollments.map(e => e.course.id)
  const filteredAvailableCourses = allCourses
    .filter(c => !enrolledCourseIds.includes(c.id))
    .filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 flex">
      <LearnerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="flex-1 md:ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-4 md:px-8 py-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
              >
                <Menu size={24} />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">My Learning</h1>
                <p className="text-sm text-gray-600 mt-1 hidden sm:block font-medium">Welcome back! Continue your learning journey ✨</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 md:p-8">
          {/* Search & Stats Section */}
          <div className="flex flex-col md:flex-row gap-6 mb-10">

        {/* Profile / Stats Panel */}
        {stats && (
          <Card className="md:w-1/3 gradient-bg text-white border-none shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] transition-all duration-500 overflow-hidden relative group">
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"></div>
            
            <div className="p-8 relative z-10">
              <div className="flex items-center space-x-5 mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl font-bold border-2 border-white/30 shadow-2xl transform group-hover:rotate-6 transition-transform duration-300">
                  {stats.badge.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xs uppercase tracking-widest opacity-90 font-bold mb-1 text-indigo-100">Current Rank</h3>
                  <p className="text-4xl font-black tracking-tight drop-shadow-lg">{stats.badge}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-black/30 to-black/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl">
                  <p className="text-indigo-100 text-xs uppercase tracking-widest font-bold mb-2">Total Points</p>
                  <p className="text-4xl font-black">{stats.totalPoints}</p>
                </div>
                <div className="bg-gradient-to-br from-black/30 to-black/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl">
                  <p className="text-indigo-100 text-xs uppercase tracking-widest font-bold mb-2">Enrolled</p>
                  <p className="text-4xl font-black">{stats.totalEnrollments}</p>
                </div>
              </div>

              <div className="pt-5 border-t border-white/20 flex items-center justify-between">
                <div>
                  <p className="text-xs text-indigo-100 font-semibold mb-1">Next Level</p>
                  <p className="text-sm font-bold text-white">{
                    stats.totalPoints < 20 ? 'Explorer (20)' :
                      stats.totalPoints < 40 ? 'Achiever (40)' :
                        stats.totalPoints < 60 ? 'Specialist (60)' :
                          stats.totalPoints < 80 ? 'Expert (80)' :
                            stats.totalPoints < 100 ? 'Master (100)' :
                              stats.totalPoints < 120 ? 'Legend (120)' : 'Max Level! 🎉'
                  }</p>
                </div>
                <Trophy size={32} className="text-yellow-300 drop-shadow-lg animate-pulse" />
              </div>
            </div>
          </Card>
        )}

        {/* Search & Info */}
        <div className="md:w-2/3 flex flex-col justify-between">
          <div className="bg-gradient-to-br from-white to-gray-50/50 p-8 rounded-3xl shadow-xl border border-gray-100 h-full relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-3xl opacity-50 -mr-20 -mt-20 group-hover:opacity-70 transition-opacity"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-violet-100 to-pink-100 rounded-full blur-3xl opacity-50 -ml-16 -mb-16 group-hover:opacity-70 transition-opacity"></div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Welcome back!</h2>
              </div>
              
              <p className="text-gray-600 mb-6 text-sm">Ready to continue your learning adventure? Search for your next course below.</p>
              
              <div className="max-w-md">
                <label className="text-sm font-bold text-gray-700 mb-2 block flex items-center space-x-2">
                  <span>Find a course</span>
                  <span className="text-indigo-600">✨</span>
                </label>
                <div className="relative group/input">
                  <input
                    type="text"
                    placeholder="Search courses by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all duration-300 shadow-sm hover:shadow-md font-medium text-gray-800 placeholder-gray-400"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400 group-focus-within/input:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-8 bg-gray-100/50 backdrop-blur-sm p-1.5 rounded-2xl border border-gray-200/50 inline-flex shadow-sm">
        <button
          onClick={() => setActiveTab('my-courses')}
          className={`px-6 py-3 text-base font-semibold rounded-xl transition-all duration-300 relative overflow-hidden ${
            activeTab === 'my-courses'
              ? 'bg-white text-indigo-600 shadow-md'
              : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
          }`}
        >
          <span className="relative z-10 flex items-center space-x-2">
            <Book size={18} />
            <span>My Courses</span>
          </span>
          {activeTab === 'my-courses' && (
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 opacity-50"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('explore')}
          className={`px-6 py-3 text-base font-semibold rounded-xl transition-all duration-300 relative overflow-hidden ${
            activeTab === 'explore'
              ? 'bg-white text-indigo-600 shadow-md'
              : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
          }`}
        >
          <span className="relative z-10 flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <span>Explore Courses</span>
          </span>
          {activeTab === 'explore' && (
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 opacity-50"></div>
          )}
        </button>
      </div>

      {/* My Courses Tab */}
      {activeTab === 'my-courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
          {filteredEnrollments.length > 0 ? (
            filteredEnrollments.map(enrollment => (
              <div key={enrollment.id}>
                {/* Render CourseCard with enrollment prop for "Start/Continue" logic */}
                <CourseCard
                  course={enrollment.course}
                  enrollment={enrollment}
                />
                {/* Extra progress bar for my courses specifically if needed, but CourseCard handles buttons. 
                        Let's keep the dashboard consistent and just use CourseCard which now supports Continue/Start. 
                    */}
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-gradient-to-br from-white to-gray-50 rounded-3xl border-2 border-dashed border-gray-300 shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Book className="h-12 w-12 text-indigo-600" />
                </div>
                <p className="text-gray-700 text-xl font-bold mb-2">
                  {searchQuery ? 'No courses found matching your search.' : "You haven't enrolled in any courses yet."}
                </p>
                <p className="text-gray-500 mb-6">Start your learning journey today!</p>
                {!searchQuery && (
                  <Button className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300" onClick={() => setActiveTab('explore')}>
                    Explore Library
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Explore Courses Tab */}
      {activeTab === 'explore' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
          {filteredAvailableCourses.length > 0 ? (
            filteredAvailableCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-gradient-to-br from-white to-gray-50 rounded-3xl border-2 border-dashed border-gray-300 shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <p className="text-gray-700 text-xl font-bold mb-2">
                  {searchQuery ? 'No courses found matching your search.' : 'No more courses available to join.'}
                </p>
                <p className="text-gray-500">Try adjusting your search or check back later for new courses.</p>
              </div>
            </div>
          )}
        </div>
      )}
      {/* End Explore Courses Tab */}
        </div>
        {/* End Content Area */}
      </div>
      {/* End Main Content */}
    </div>
  )
}
// Import CourseCard locally if not imported
import CourseCard from '../components/CourseCard'

export default LearnerDashboard
