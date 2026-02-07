import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import CourseEditor from './pages/CourseEditor'
import LearnerDashboard from './pages/LearnerDashboard'
import CourseDetail from './pages/CourseDetail'
import LessonPlayer from './pages/LessonPlayer'
import QuizPage from './pages/QuizPage'
import ReportingDashboard from './pages/ReportingDashboard'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />
  }

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

      {/* Learner Routes */}
      <Route path="/learner/dashboard" element={
        <ProtectedRoute allowedRoles={['LEARNER']}>
          <LearnerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/course/:id" element={
        <ProtectedRoute>
          <CourseDetail />
        </ProtectedRoute>
      } />
      <Route path="/lesson/:id" element={
        <ProtectedRoute>
          <LessonPlayer />
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
