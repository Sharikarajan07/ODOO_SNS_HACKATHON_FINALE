import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import LearnerSidebar from '../components/LearnerSidebar'
import { Card } from '../components/ui'
import { Menu } from 'lucide-react'

const LearnerProfile = () => {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
              <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>
              <p className="text-sm text-gray-500 mt-1 hidden sm:block">Manage your account information</p>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-4xl mx-auto">
          {/* Profile Info Card */}
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-5xl shadow-xl">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-gray-900">{user?.name}</h2>
                <p className="text-lg text-gray-600">{user?.email}</p>
                <div className="flex justify-center">
                  <span className="inline-block px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-sm font-semibold shadow-md">
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default LearnerProfile
