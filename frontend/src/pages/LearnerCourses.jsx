import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LearnerSidebar from '../components/LearnerSidebar'
import CourseCard from '../components/CourseCard'
import { Book, Menu } from 'lucide-react'
import api from '../services/api'
import { Button } from '../components/ui'

const LearnerCourses = () => {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchEnrollments()
  }, [])

  const fetchEnrollments = async () => {
    try {
      const response = await api.get('/enrollments/my')
      setEnrollments(response.data)
    } catch (error) {
      console.error('Failed to fetch enrollments', error)
    } finally {
      setLoading(false)
    }
  }

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
              <h1 className="text-2xl font-bold text-gray-800">My Courses</h1>
              <p className="text-sm text-gray-500 mt-1 hidden sm:block">Track your enrolled courses and progress</p>
            </div>
          </div>
        </header>

        <div className="p-8">
          {loading ? (
            <div className="text-center py-12">Loading courses...</div>
          ) : enrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map(enrollment => (
                <CourseCard
                  key={enrollment.id}
                  course={enrollment.course}
                  enrollment={enrollment}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-white rounded-2xl border border-gray-200 shadow-sm">
              <Book className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg mb-4">You haven't enrolled in any courses yet.</p>
              <Button onClick={() => navigate('/learner/explore')}>
                Explore Courses
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LearnerCourses
