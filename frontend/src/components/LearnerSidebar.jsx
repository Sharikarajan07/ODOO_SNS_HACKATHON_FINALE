import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Home, BookOpen, Search, LogOut, Award, TrendingUp, X, GraduationCap } from 'lucide-react'

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
      icon: TrendingUp,
      label: 'Analytics',
      path: '/learner/analytics',
      active: location.pathname === '/learner/analytics'
    },
    {
      icon: Award,
      label: 'Achievements',
      path: '/learner/achievements',
      active: location.pathname === '/learner/achievements'
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
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                LearnSphere
              </h1>
              <p className="text-xs text-gray-500">Learning Platform</p>
            </div>
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
      <div className="p-5 border-b border-gray-200/50 bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50 relative overflow-hidden group">
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/50 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="flex items-center space-x-3 relative z-10">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-600 to-violet-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 ring-4 ring-white/50">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
            <div className="flex items-center space-x-1.5 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-xs text-indigo-700 font-bold uppercase tracking-wider">LEARNER</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-6 px-3">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  item.active
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-200/50 scale-105'
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-900 hover:shadow-md'
                }`}
              >
                {item.active && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
                <Icon size={20} className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${item.active ? 'text-white' : 'text-gray-400 group-hover:text-indigo-600'}`} />
                <span className="relative z-10">{item.label}</span>
                {item.active && (
                  <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200/50 bg-gradient-to-br from-gray-50 to-white">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 group font-medium border-2 border-transparent hover:border-red-200 hover:shadow-md"
        >
          <LogOut size={20} className="transform group-hover:scale-110 group-hover:-translate-x-1 transition-all duration-300" />
          <span>Logout</span>
        </button>
      </div>
    </div>
    </>
  )
}

export default LearnerSidebar
