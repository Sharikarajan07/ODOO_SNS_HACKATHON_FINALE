import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { Button } from '../components/ui'
import { Skeleton } from '../components/ui/Skeleton'
import { useToast } from '../context/ToastContext'
import { Plus, LayoutGrid, List, Search, BookOpen, Filter } from 'lucide-react'
import api from '../services/api'
import CourseCard from '../components/CourseCard'

const CoursesPage = () => {
  const [courses, setCourses] = useState([])
  const [viewMode, setViewMode] = useState('grid')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // all, published, draft
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newCourseTitle, setNewCourseTitle] = useState('')
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses')
      setCourses(response.data)
    } catch (error) {
      console.error('Failed to fetch courses', error)
      toast.error('Failed to load courses')
    } finally {
      setTimeout(() => setLoading(false), 300)
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
      setNewCourseTitle('')
      navigate(`/admin/course/${response.data.id}/edit`)
    } catch (error) {
      toast.error('Failed to create course')
    }
  }

  const filteredCourses = courses
    .filter(course => course.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(course => {
      if (filterStatus === 'published') return course.published
      if (filterStatus === 'draft') return !course.published
      return true
    })

  if (loading) {
    return (
      <Layout title="Courses">
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

  return (
    <Layout title="All Courses">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
          <p className="text-gray-600 mt-1">Create, edit, and manage your courses</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/50"
        >
          <Plus size={18} className="mr-2" />
          Create New Course
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-indigo-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Courses</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">{courses.length}</p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <BookOpen size={20} className="text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Published</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {courses.filter(c => c.published).length}
              </p>
            </div>
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <BookOpen size={20} className="text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Drafts</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {courses.filter(c => !c.published).length}
              </p>
            </div>
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <BookOpen size={20} className="text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search, Filter & View Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm"
          >
            <option value="all">All Courses</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
          </select>

          <div className="flex bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 transition-colors ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 transition-colors border-l ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Courses Grid/List */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <BookOpen className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery || filterStatus !== 'all' ? 'No courses found' : 'No courses yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Get started by creating your first course'
            }
          </p>
          {!searchQuery && filterStatus === 'all' && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus size={18} className="mr-2" />
              Create First Course
            </Button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up">
          {filteredCourses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              onDelete={deleteCourse}
              onTogglePublish={togglePublish}
              isAdmin={true}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Course</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Enrollments</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lessons</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCourses.map(course => (
                <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img 
                        src={course.image || 'https://via.placeholder.com/60'} 
                        alt={course.title}
                        className="w-12 h-12 rounded-lg object-cover mr-4"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">{course.title}</div>
                        <div className="text-sm text-gray-500">
                          {course.description?.substring(0, 50) || 'No description'}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      course.published 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {course.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{course.enrollmentCount || 0}</td>
                  <td className="px-6 py-4 text-gray-700">{course.lessonCount || 0}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/admin/course/${course.id}/edit`)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant={course.published ? 'outline' : 'default'}
                        onClick={() => togglePublish(course)}
                      >
                        {course.published ? 'Unpublish' : 'Publish'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Create New Course</h3>
            <input
              type="text"
              placeholder="Enter course title..."
              value={newCourseTitle}
              onChange={(e) => setNewCourseTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateCourse()}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-6"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false)
                  setNewCourseTitle('')
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateCourse}>
                Create Course
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default CoursesPage
