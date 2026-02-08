import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LearnerSidebar from '../components/LearnerSidebar'
import CourseCard from '../components/CourseCard'
import { Search, Menu } from 'lucide-react'
import api from '../services/api'

const LearnerExplore = () => {
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [coursesRes, enrollmentsRes] = await Promise.all([
        api.get('/courses'),
        api.get('/enrollments/my')
      ])
      setCourses(coursesRes.data)
      setEnrollments(enrollmentsRes.data)
    } catch (error) {
      console.error('Failed to fetch data', error)
    } finally {
      setLoading(false)
    }
  }

  const enrolledCourseIds = enrollments.map(e => e.course.id)
  const availableCourses = courses
    .filter(c => !enrolledCourseIds.includes(c.id))
    .filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <LearnerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 md:ml-64 min-h-screen">
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-gray-600 hover:text-gray-900"
            >
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Explore Courses</h1>
              <p className="text-sm text-gray-500 mt-1 hidden sm:block">Discover new courses to enhance your skills</p>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Search Bar */}
          <div className="mb-8 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search courses by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">Loading courses...</div>
          ) : availableCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-white rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-gray-500 text-lg">
                {searchQuery ? 'No courses found matching your search.' : 'No more courses available to join.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LearnerExplore
