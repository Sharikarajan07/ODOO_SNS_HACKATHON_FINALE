import { useState } from 'react'
import Layout from '../components/Layout'
import { Card, Button, Badge } from '../components/ui'
import { User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../services/api'

const SettingsPage = () => {
  const { user, setUser } = useAuth()
  const toast = useToast()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await api.put(`/users/${user.id}`, formData)
      const updatedUser = response.data
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Failed to update profile', error)
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || ''
    })
  }

  return (
    <Layout title="Settings">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Settings</h2>
          <p className="text-gray-500 mt-1.5 text-sm">Manage your account and system preferences</p>
          <div className="absolute -z-10 -left-4 -top-2 w-24 h-24 bg-indigo-100 rounded-full blur-3xl opacity-20"></div>
        </div>

        {/* Profile Settings Card */}
        <Card className="p-8 bg-white rounded-3xl shadow-lg border border-gray-100">
          <div className="space-y-6">
            <h3 className="text-xl font-black text-gray-900 mb-6">Profile Settings</h3>
            
            {/* Avatar Section */}
            <div className="flex items-center space-x-6 mb-8 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-indigo-100">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">{user?.name}</h4>
                <p className="text-sm text-gray-500 font-medium mt-1">{user?.email}</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Role</label>
                <Badge variant="secondary" className="text-sm py-1.5 px-4 bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 rounded-xl">
                  {user?.role}
                </Badge>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t-2 border-gray-100 flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="border-2 hover:bg-gray-50 rounded-xl font-bold px-6"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={loading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 rounded-xl font-bold px-6"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  )
}

export default SettingsPage
