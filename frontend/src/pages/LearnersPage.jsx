import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Card, Button, Badge } from '../components/ui'
import { Users, Mail, Calendar, Award } from 'lucide-react'
import api from '../services/api'

const LearnersPage = () => {
  const [learners, setLearners] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchLearners()
  }, [])

  const fetchLearners = async () => {
    try {
      const response = await api.get('/users')
      const learnersOnly = response.data.filter(user => user.role === 'LEARNER')
      setLearners(learnersOnly)
    } catch (error) {
      console.error('Failed to fetch learners', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLearners = learners.filter(learner =>
    learner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    learner.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <Layout title="Learners">
        <div className="text-center py-12">Loading learners...</div>
      </Layout>
    )
  }

  return (
    <Layout title="Learners">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Manage Learners</h2>
            <p className="text-gray-600 mt-1">View and manage learner accounts</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-4 py-2">
              <Users size={16} className="mr-2 inline" />
              {learners.length} Total Learners
            </Badge>
          </div>
        </div>

        {/* Search */}
        <Card>
          <div className="p-4">
            <input
              type="text"
              placeholder="Search learners by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </Card>

        {/* Learners Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Learner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLearners.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No learners found
                    </td>
                  </tr>
                ) : (
                  filteredLearners.map((learner) => (
                    <tr key={learner.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                            {learner.name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{learner.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail size={14} className="mr-2 text-gray-400" />
                          {learner.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="secondary">{learner.role}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="success">Active</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button size="sm" variant="ghost" className="text-indigo-600 hover:text-indigo-800">
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-indigo-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Learners</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{learners.length}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <Users size={24} className="text-indigo-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Active This Month</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">{learners.length}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <Calendar size={24} className="text-emerald-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Top Performers</p>
                <p className="text-3xl font-bold text-amber-600 mt-2">{Math.ceil(learners.length * 0.2)}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Award size={24} className="text-amber-600" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  )
}

export default LearnersPage
