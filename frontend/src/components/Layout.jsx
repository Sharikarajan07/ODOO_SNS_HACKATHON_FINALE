import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { LogOut, Home, BookOpen, BarChart3, User } from 'lucide-react'

const Layout = ({ children, title }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary-600">LearnSphere</h1>
              {title && <span className="text-gray-400">|</span>}
              {title && <h2 className="text-xl text-gray-700">{title}</h2>}
            </div>
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/learner/dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-primary-600"
              >
                <Home size={20} />
                <span>Home</span>
              </button>
              {user && (
                <div className="flex items-center space-x-2 text-gray-700">
                  <User size={20} />
                  <span>{user.name}</span>
                  <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                    {user.role}
                  </span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

export default Layout
