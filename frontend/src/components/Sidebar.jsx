import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Users, BarChart3, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Sidebar = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { logout } = useAuth()

    const isActive = (path) => location.pathname === path

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: BookOpen, label: 'Courses', path: '/admin/courses' },
        { icon: Users, label: 'Learners', path: '/admin/learners' },
        { icon: BarChart3, label: 'Reports', path: '/admin/reporting/all' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ]

    return (
        <div className="h-screen w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0 border-r border-slate-800 shadow-2xl z-50">
            {/* Brand */}
            <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <span className="font-bold text-lg">L</span>
                </div>
                <span className="text-xl font-bold tracking-tight">LearnSphere</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                    Main Menu
                </p>
                {menuItems.map((item) => (
                    <Link
                        key={item.label}
                        to={item.path}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group
              ${isActive(item.path.split('?')[0])
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <item.icon size={20} className={`transition-colors ${isActive(item.path.split('?')[0]) ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                        <span className="font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* User & Logout */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>
        </div>
    )
}

export default Sidebar
