import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import CourseEditor from './pages/CourseEditor'
import LearnerDashboard from './pages/LearnerDashboard'
import LearnerCourses from './pages/LearnerCourses'
import LearnerExplore from './pages/LearnerExplore'
import LearnerAchievements from './pages/LearnerAchievements'
import LearnerProfile from './pages/LearnerProfile'
import CourseDetail from './pages/CourseDetail'
import LessonPlayer from './pages/LessonPlayer'
import QuizPage from './pages/QuizPage'
import ReportingDashboard from './pages/ReportingDashboard'
import QuizBuilder from './pages/QuizBuilder'
import LearnersPage from './pages/LearnersPage'
import SettingsPage from './pages/SettingsPage'
import CoursesPage from './pages/CoursesPage'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()

  if (loading) {
    console.log('[ProtectedRoute] Auth loading...')
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!user) {
    console.log('[ProtectedRoute] No user, redirecting to login')
    return <Navigate to="/login" />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log('[ProtectedRoute] User role not allowed:', user.role, 'Required:', allowedRoles)
    return <Navigate to="/" />
  }

  console.log('[ProtectedRoute] Access granted for:', user.role)
  return children
}

const AppRoutes = () => {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={
        user ? (
          user.role === 'LEARNER' ? <Navigate to="/learner/dashboard" /> :
            user.role === 'ADMIN' || user.role === 'INSTRUCTOR' ? <Navigate to="/admin/dashboard" /> :
              <Navigate to="/login" />
        ) : <Navigate to="/login" />
      } />

      {/* Admin/Instructor Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'INSTRUCTOR']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/courses" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'INSTRUCTOR']}>
          <CoursesPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/course/new" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'INSTRUCTOR']}>
          <CourseEditor />
        </ProtectedRoute>
      } />
      <Route path="/admin/course/:id/edit" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'INSTRUCTOR']}>
          <CourseEditor />
        </ProtectedRoute>
      } />
      <Route path="/admin/reporting/:courseId" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'INSTRUCTOR']}>
          <ReportingDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/course/:courseId/quiz/:quizId" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'INSTRUCTOR']}>
          <QuizBuilder />
        </ProtectedRoute>
      } />
      <Route path="/admin/learners" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'INSTRUCTOR']}>
          <LearnersPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'INSTRUCTOR']}>
          <SettingsPage />
        </ProtectedRoute>
      } />

      {/* Learner Routes */}
      <Route path="/learner/dashboard" element={
        <ProtectedRoute allowedRoles={['LEARNER']}>
          <LearnerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/learner/courses" element={
        <ProtectedRoute allowedRoles={['LEARNER']}>
          <LearnerCourses />
        </ProtectedRoute>
      } />
      <Route path="/learner/explore" element={
        <ProtectedRoute allowedRoles={['LEARNER']}>
          <LearnerExplore />
        </ProtectedRoute>
      } />
      <Route path="/learner/achievements" element={
        <ProtectedRoute allowedRoles={['LEARNER']}>
          <LearnerAchievements />
        </ProtectedRoute>
      } />
      <Route path="/learner/profile" element={
        <ProtectedRoute allowedRoles={['LEARNER']}>
          <LearnerProfile />
        </ProtectedRoute>
      } />
      <Route path="/course/:id" element={
        <ProtectedRoute>
          <CourseDetail />
        </ProtectedRoute>
      } />
      <Route path="/lesson/:id" element={
        <ProtectedRoute>
          <LessonPlayer key={window.location.pathname} />
        </ProtectedRoute>
      } />
      <Route path="/quiz/:quizId" element={
        <ProtectedRoute>
          <QuizPage />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

import { ToastProvider } from './context/ToastContext'

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
