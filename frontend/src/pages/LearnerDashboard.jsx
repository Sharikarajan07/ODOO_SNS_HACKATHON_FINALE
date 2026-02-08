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
      <div className="min-h-screen bg-gray-50 flex">
        <LearnerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 md:ml-64 p-8">
          <div className="text-center py-12">Loading...</div>
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
    <div className="min-h-screen bg-gray-50 flex">
      <LearnerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="flex-1 md:ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden text-gray-600 hover:text-gray-900"
              >
                <Menu size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">My Learning</h1>
                <p className="text-sm text-gray-500 mt-1 hidden sm:block">Welcome back! Continue your learning journey</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          {/* Search & Stats Section */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">

        {/* Profile / Stats Panel */}
        {stats && (
          <Card className="md:w-1/3 gradient-bg text-white border-none shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl font-bold border-2 border-white/30 shadow-inner">
                  {stats.badge.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm uppercase tracking-wider opacity-80 font-semibold">Current Rank</h3>
                  <p className="text-3xl font-bold tracking-tight">{stats.badge}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black/20 backdrop-blur-md rounded-xl p-4 border border-white/10">
                  <p className="text-indigo-200 text-xs uppercase tracking-wider font-bold">Total Points</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalPoints}</p>
                </div>
                <div className="bg-black/20 backdrop-blur-md rounded-xl p-4 border border-white/10">
                  <p className="text-indigo-200 text-xs uppercase tracking-wider font-bold">Enrolled</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalEnrollments}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-sm text-indigo-100 font-medium">
                <span>Next Level: {
                  stats.totalPoints < 20 ? 'Newbie (20)' :
                    stats.totalPoints < 40 ? 'Explorer (40)' :
                      stats.totalPoints < 60 ? 'Achiever (60)' :
                        stats.totalPoints < 80 ? 'Specialist (80)' :
                          stats.totalPoints < 100 ? 'Expert (100)' :
                            stats.totalPoints < 120 ? 'Master (120)' : 'Max Level'
                }</span>
                <Trophy size={18} className="text-yellow-300" />
              </div>
            </div>
          </Card>
        )}

        {/* Search & Info */}
        <div className="md:w-2/3 flex flex-col justify-between">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Welcome back!</h2>
            <div className="max-w-md">
              <label className="text-sm font-medium text-gray-500 mb-1 block">Find a course</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search courses by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('my-courses')}
          className={`pb-4 px-2 text-lg font-medium transition-colors relative ${activeTab === 'my-courses' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          My Courses
          {activeTab === 'my-courses' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full"></div>}
        </button>
        <button
          onClick={() => setActiveTab('explore')}
          className={`pb-4 px-2 text-lg font-medium transition-colors relative ${activeTab === 'explore' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Explore Courses
          {activeTab === 'explore' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full"></div>}
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
            <div className="col-span-full py-16 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Book className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">
                {searchQuery ? 'No courses found matching your search.' : "You haven't enrolled in any courses yet."}
              </p>
              {!searchQuery && (
                <Button className="mt-4" onClick={() => setActiveTab('explore')}>
                  Explore Library
                </Button>
              )}
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
            <div className="col-span-full py-16 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-500">
                {searchQuery ? 'No courses found matching your search.' : 'No more courses available to join.'}
              </p>
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
