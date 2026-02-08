import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import LearnerSidebar from '../components/LearnerSidebar'
import { Card, Input, Button } from '../components/ui'
import { User, Mail, Lock, Save, Menu } from 'lucide-react'

const LearnerProfile = () => {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleUpdateProfile = (e) => {
    e.preventDefault()
    // TODO: Implement profile update API call
    alert('Profile update functionality coming soon!')
  }

  const handleChangePassword = (e) => {
    e.preventDefault()
    if (formData.newPassword !== formData.confirmPassword) {
      alert('New passwords do not match!')
      return
    }
    // TODO: Implement password change API call
    alert('Password change functionality coming soon!')
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
              <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>
              <p className="text-sm text-gray-500 mt-1 hidden sm:block">Manage your account information</p>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-4xl">
          {/* Profile Info Card */}
          <Card className="p-8 mb-6">
            <div className="flex items-center space-x-6 mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-lg">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                <p className="text-gray-500">{user?.email}</p>
                <div className="mt-2">
                  <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User size={16} className="inline mr-2" />
                    Full Name
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail size={16} className="inline mr-2" />
                    Email Address
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                  />
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full md:w-auto">
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </form>
          </Card>

          {/* Change Password Card */}
          <Card className="p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Change Password</h3>
            <form onSubmit={handleChangePassword}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock size={16} className="inline mr-2" />
                    Current Password
                  </label>
                  <Input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock size={16} className="inline mr-2" />
                    New Password
                  </label>
                  <Input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock size={16} className="inline mr-2" />
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="pt-4">
                  <Button type="submit" variant="secondary" className="w-full md:w-auto">
                    <Lock size={16} className="mr-2" />
                    Update Password
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default LearnerProfile
