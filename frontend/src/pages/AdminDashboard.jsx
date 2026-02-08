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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-12 w-full md:w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-96 w-full rounded-2xl" />)}
        </div>
      </Layout>
    )
  }

  // PREMIUM SAAS DASHBOARD DESIGN
  return (
    <Layout title="Overview">
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
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Configuration</h2>
          <p className="text-gray-500 mt-1">Manage your courses and content</p>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto bg-white p-1.5 rounded-xl shadow-sm border border-gray-100">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-64 bg-transparent border-none focus:ring-0 text-sm placeholder-gray-400"
            />
          </div>

          <div className="h-6 w-px bg-gray-200 mx-2"></div>

          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List size={18} />
            </button>
          </div>

          <Button
            onClick={() => setShowCreateModal(true)}
            className="ml-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-md hover:shadow-lg transition-all"
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen size={24} className="text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No courses yet</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">Get started by creating your first course. It only takes a few minutes.</p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus size={18} className="mr-2" />
            Create Course
          </Button>
        </div>
      )}
      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-96 p-6 animate-fade-in-up">
            <h3 className="text-xl font-bold mb-4">Create New Course</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
              <input
                type="text"
                value={newCourseTitle}
                onChange={(e) => setNewCourseTitle(e.target.value)}
                placeholder="e.g. Advanced React Patterns"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button onClick={handleCreateCourse}>Create</Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

// Helper Component for Stats
const StatCard = ({ title, value, icon: Icon, trend, trendUp, color = 'indigo' }) => {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    purple: 'bg-purple-50 text-purple-600',
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colors[color]} bg-opacity-50`}>
          <Icon size={24} />
        </div>
      </div>
      <div className="mt-4 flex items-center text-xs">
        <span className={`flex items-center font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
          {trendUp ? '↑' : '↓'} {trend}
        </span>
        <span className="text-gray-400 ml-2">vs last month</span>
      </div>
    </div>
  )
}

export default AdminDashboard
