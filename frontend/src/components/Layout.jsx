import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Home, User, BookOpen } from 'lucide-react'
import Sidebar from './Sidebar'

const Layout = ({ children, title }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isAdmin = user?.role === 'ADMIN'
  // Check if we are in an admin route to enforce sidebar
  const isAdminRoute = location.pathname.startsWith('/admin')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // 1. ADMIN LAYOUT (Sidebar)
  if (isAdmin && isAdminRoute) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 ml-64 min-h-screen flex flex-col">
          {/* Admin Header (Lean) */}
          <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100 px-8 py-4 flex items-center justify-between">
            <div>
              {title && <h1 className="text-xl font-bold text-gray-800">{title}</h1>}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                  {user.name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-gray-700 pr-2">{user.name}</span>
              </div>
            </div>
          </header>

          <main className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto animate-fade-in-up">
              {children}
            </div>
          </main>
        </div>
      </div>
    )
  }

  // 2. LEARNER LAYOUT (Top Navbar)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                LearnSphere
              </h1>
              {title && <span className="text-gray-300">|</span>}
              {title && <h2 className="text-lg text-gray-600 font-medium">{title}</h2>}
            </div>
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate('/learner/dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <Home size={20} />
                <span>Home</span>
              </button>
              <button
                onClick={() => navigate('/learner/dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <BookOpen size={20} />
                <span>Courses</span>
              </button>
              {user && (
                <div className="flex items-center space-x-2 text-gray-700">
                  <User size={20} />
                  <span>{user.name}</span>
                  <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full border border-indigo-100">
                    {user.role}
                  </span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-500 hover:text-red-600 transition-colors"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header >

      {/* Main Content */}
      < main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" >
        {children}
      </main >
    </div >
  )
}

export default Layout
