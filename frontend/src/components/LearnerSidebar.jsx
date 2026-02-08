import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Home, BookOpen, Search, User, LogOut, Award, TrendingUp, X } from 'lucide-react'

const LearnerSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleNavigate = (path) => {
    navigate(path)
    if (onClose) onClose() // Close sidebar on mobile after navigation
  }

  const menuItems = [
    {
      icon: Home,
      label: 'Dashboard',
      path: '/learner/dashboard',
      active: location.pathname === '/learner/dashboard'
    },
    {
      icon: BookOpen,
      label: 'My Courses',
      path: '/learner/courses',
      active: location.pathname === '/learner/courses'
    },
    {
      icon: Search,
      label: 'Explore',
      path: '/learner/explore',
      active: location.pathname === '/learner/explore'
    },
    {
      icon: Award,
      label: 'Achievements',
      path: '/learner/achievements',
      active: location.pathname === '/learner/achievements'
    },
    {
      icon: User,
      label: 'Profile',
      path: '/learner/profile',
      active: location.pathname === '/learner/profile'
    }
  ]

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 shadow-lg flex flex-col z-50 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Logo/Brand */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              LearnSphere
            </h1>
            <p className="text-sm text-gray-500 mt-1">Learning Platform</p>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="md:hidden text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-br from-indigo-50 to-violet-50">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-indigo-600 font-medium uppercase tracking-wide">LEARNER</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  item.active
                    ? 'bg-indigo-50 text-indigo-700 font-medium shadow-sm border border-indigo-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={20} className={item.active ? 'text-indigo-600' : 'text-gray-400'} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
    </>
  )
}

export default LearnerSidebar
