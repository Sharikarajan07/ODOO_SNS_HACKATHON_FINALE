import { useState, useEffect } from 'react'
import LearnerSidebar from '../components/LearnerSidebar'
import { Card, Badge } from '../components/ui'
import { Trophy, Award, Star, Target, TrendingUp, Menu } from 'lucide-react'
import api from '../services/api'

const LearnerAchievements = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await api.get('/reporting/learner/dashboard')
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch stats', error)
    } finally {
      setLoading(false)
    }
  }

  const badges = [
    { name: 'Newbie', points: 0, icon: Star, color: 'bg-gray-100 text-gray-600', achieved: true },
    { name: 'Explorer', points: 20, icon: Target, color: 'bg-blue-100 text-blue-600', achieved: stats?.totalPoints >= 20 },
    { name: 'Achiever', points: 40, icon: Award, color: 'bg-green-100 text-green-600', achieved: stats?.totalPoints >= 40 },
    { name: 'Specialist', points: 60, icon: TrendingUp, color: 'bg-purple-100 text-purple-600', achieved: stats?.totalPoints >= 60 },
    { name: 'Expert', points: 80, icon: Trophy, color: 'bg-orange-100 text-orange-600', achieved: stats?.totalPoints >= 80 },
    { name: 'Master', points: 100, icon: Trophy, color: 'bg-red-100 text-red-600', achieved: stats?.totalPoints >= 100 },
    { name: 'Legend', points: 120, icon: Trophy, color: 'bg-yellow-100 text-yellow-600', achieved: stats?.totalPoints >= 120 }
  ]

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
              <h1 className="text-2xl font-bold text-gray-800">Achievements</h1>
              <p className="text-sm text-gray-500 mt-1 hidden sm:block">Track your progress and unlock badges</p>
            </div>
          </div>
        </header>

        <div className="p-8">
          {loading ? (
            <div className="text-center py-12">Loading achievements...</div>
          ) : (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider">Total Points</p>
                      <p className="text-4xl font-bold mt-2">{stats?.totalPoints || 0}</p>
                    </div>
                    <Trophy size={48} className="text-white opacity-20" />
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white border-none shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium uppercase tracking-wider">Completed Courses</p>
                      <p className="text-4xl font-bold mt-2">{stats?.completedCourses || 0}</p>
                    </div>
                    <Award size={48} className="text-white opacity-20" />
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-orange-500 to-red-600 text-white border-none shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium uppercase tracking-wider">Current Rank</p>
                      <p className="text-2xl font-bold mt-2">{stats?.badge || 'Newbie'}</p>
                    </div>
                    <Star size={48} className="text-white opacity-20" />
                  </div>
                </Card>
              </div>

              {/* Badges Grid */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Badge Collection</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {badges.map((badge, index) => {
                    const Icon = badge.icon
                    const isAchieved = badge.achieved
                    return (
                      <Card
                        key={index}
                        className={`p-6 text-center transition-all ${
                          isAchieved
                            ? 'border-2 border-indigo-200 shadow-lg scale-105'
                            : 'opacity-40 grayscale'
                        }`}
                      >
                        <div
                          className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${
                            isAchieved ? badge.color : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          <Icon size={32} />
                        </div>
                        <p className={`font-bold text-sm ${isAchieved ? 'text-gray-900' : 'text-gray-400'}`}>
                          {badge.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{badge.points}+ pts</p>
                      </Card>
                    )
                  })}
                </div>
              </div>

              {/* Progress to Next Badge */}
              <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Progress to Next Level</h3>
                {stats?.totalPoints < 120 ? (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Current: {stats?.badge}</span>
                      <span className="text-sm text-gray-600">
                        Next: {
                          stats?.totalPoints < 20 ? 'Explorer' :
                          stats?.totalPoints < 40 ? 'Achiever' :
                          stats?.totalPoints < 60 ? 'Specialist' :
                          stats?.totalPoints < 80 ? 'Expert' :
                          stats?.totalPoints < 100 ? 'Master' : 'Legend'
                        }
                      </span>
                    </div>
                    <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                        style={{
                          width: `${((stats?.totalPoints % 20) / 20) * 100}%`
                        }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {20 - (stats?.totalPoints % 20)} more points needed
                    </p>
                  </>
                ) : (
                  <p className="text-green-600 font-semibold">🎉 Congratulations! You've achieved the highest rank!</p>
                )}
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default LearnerAchievements
