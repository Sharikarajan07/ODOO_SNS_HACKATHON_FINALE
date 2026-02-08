import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { Button } from '../components/ui'
import { Skeleton } from '../components/ui/Skeleton'
import { useToast } from '../context/ToastContext'
import { Plus, LayoutGrid, List, Search, BookOpen, Users, Layers, Activity } from 'lucide-react'
import api from '../services/api'
import CourseCard from '../components/CourseCard'

const AdminDashboard = () => {
  const [courses, setCourses] = useState([])
  const [stats, setStats] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newCourseTitle, setNewCourseTitle] = useState('')
  const navigate = useNavigate()
  const toast = useToast()

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
      toast.error('Failed to load dashboard data')
    } finally {
      // Add artificial delay to show off the skeleton if it loads too fast (optional, but good for UX feel)
      setTimeout(() => setLoading(false), 500)
    }
  }

  const deleteCourse = async (id) => {
    if (!confirm('Are you sure you want to delete this course?')) return

    try {
      await api.delete(`/courses/${id}`)
      setCourses(courses.filter(c => c.id !== id))
      toast.success('Course deleted successfully')
    } catch (error) {
      toast.error('Failed to delete course')
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
      toast.success(`Course ${course.published ? 'unpublished' : 'published'} successfully`)
    } catch (error) {
      toast.error('Failed to update course status')
    }
  }

  const handleCreateCourse = async () => {
    if (!newCourseTitle.trim()) {
      toast.warning('Please enter a course title')
      return
    }

    try {
      const response = await api.post('/courses', {
        title: newCourseTitle,
        description: '',
        tags: [],
        visibility: 'PUBLIC',
        accessRule: 'FREE'
      })
      toast.success('Course created')
      setShowCreateModal(false)
      navigate(`/admin/course/${response.data.id}/edit`)
    } catch (error) {
      toast.error('Failed to create course')
    }
  }

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 min-h-screen -m-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
          </div>
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
            <Skeleton className="h-12 w-48 rounded-xl" />
            <Skeleton className="h-12 w-full md:w-96 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-96 w-full rounded-2xl" />)}
          </div>
        </div>
      </Layout>
    )
  }

  // PREMIUM SAAS DASHBOARD DESIGN
  return (
    <Layout title="Overview">
      <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50/30 min-h-screen -m-6 p-6">
        {/* 1. HERO STATS SECTION */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard
              title="Total Courses"
              value={stats.totalCourses}
              icon={BookOpen}
              trend="+12%"
              trendUp={true}
              color="indigo"
            />
            <StatCard
              title="Total Learners"
              value={stats.totalLearners}
              icon={Users}
              trend="+5%"
              trendUp={true}
              color="purple"
            />
            <StatCard
              title="Total Enrollments"
              value={stats.totalEnrollments}
              icon={Layers}
              trend="+8%"
              trendUp={true}
              color="blue"
            />
            <StatCard
              title="Active Enrollments"
              value={stats.activeEnrollments}
              icon={Activity}
              trend="Steady"
              trendUp={true}
              color="emerald"
            />
          </div>
        )}

        {/* 2. ACTIONS & FILTERS HEADER */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Configuration</h2>
            <p className="text-gray-500 mt-1.5 text-sm">Manage your courses and content</p>
            <div className="absolute -z-10 -left-4 -top-2 w-24 h-24 bg-indigo-100 rounded-full blur-3xl opacity-20"></div>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto bg-white p-2 rounded-2xl shadow-lg border border-gray-100/50 backdrop-blur-sm">
            {/* Search */}
            <div className="relative group">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50 group-focus-within:bg-indigo-100 transition-colors">
                <Search className="text-indigo-600" size={16} />
              </div>
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 pr-4 py-2.5 w-72 bg-transparent border-none focus:ring-0 text-sm placeholder-gray-400 font-medium"
              />
            </div>

            <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent"></div>

            {/* View Toggle */}
            <div className="flex bg-gray-50 rounded-xl p-1.5 gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'grid' ? 'bg-white shadow-md text-indigo-600 scale-105' : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'list' ? 'bg-white shadow-md text-indigo-600 scale-105' : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'}`}
              >
                <List size={18} />
              </button>
            </div>

            <Button
              onClick={() => setShowCreateModal(true)}
              className="ml-2 bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-700 hover:via-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105"
            >
              <Plus size={18} className="mr-2" />
              New Course
            </Button>
          </div>
        </div>

        {/* 3. COURSES CONTENT */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
            {filteredCourses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                viewMode="grid"
                isAdmin={true}
                onDelete={deleteCourse}
                onTogglePublish={togglePublish}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100/50 overflow-hidden backdrop-blur-sm">
            <div className="divide-y divide-gray-100">
              {filteredCourses.map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  viewMode="list"
                  isAdmin={true}
                  onDelete={deleteCourse}
                  onTogglePublish={togglePublish}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {courses.length === 0 && !loading && (
          <div className="text-center py-24 bg-gradient-to-br from-white to-indigo-50/30 rounded-3xl border-2 border-dashed border-indigo-200 relative overflow-hidden group hover:border-indigo-300 transition-all">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-3xl opacity-20 -z-10"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-full blur-3xl opacity-20 -z-10"></div>
            <div className="relative z-10">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <BookOpen size={32} className="text-indigo-600" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">No courses yet</h3>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto text-sm">Get started by creating your first course. It only takes a few minutes.</p>
              <Button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105">
                <Plus size={18} className="mr-2" />
                Create Your First Course
              </Button>
            </div>
          </div>
        )}
        {/* Create Course Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-fade-in-up relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-3xl opacity-30 -z-10"></div>
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                    <Plus size={24} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900">Create New Course</h3>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Course Title</label>
                  <input
                    type="text"
                    value={newCourseTitle}
                    onChange={(e) => setNewCourseTitle(e.target.value)}
                    placeholder="e.g. Advanced React Patterns"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowCreateModal(false)} className="rounded-xl px-6">Cancel</Button>
                  <Button onClick={handleCreateCourse} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all duration-300 rounded-xl px-6">Create Course</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

// Helper Component for Stats
const StatCard = ({ title, value, icon: Icon, trend, trendUp, color = 'indigo' }) => {
  const colors = {
    indigo: 'from-indigo-500 to-indigo-600',
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
  }

  const bgColors = {
    indigo: 'bg-indigo-50',
    purple: 'bg-purple-50',
    blue: 'bg-blue-50',
    emerald: 'bg-emerald-50',
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-32 h-32 ${bgColors[color]} rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-10`}></div>
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">{title}</p>
          <h3 className="text-4xl font-black text-gray-900 mt-2">{value}</h3>
        </div>
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${colors[color]} shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
          <Icon size={28} className="text-white" />
        </div>
      </div>
      <div className="mt-5 flex items-center text-xs pt-4 border-t border-gray-100">
        <span className={`flex items-center font-bold px-2 py-1 rounded-lg ${trendUp ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
          {trendUp ? '↑' : '↓'} {trend}
        </span>
        <span className="text-gray-400 ml-2 font-medium">vs last month</span>
      </div>
    </div>
  )
}

export default AdminDashboard
