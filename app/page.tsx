"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { LoginForm } from "@/components/login-form"
import { Sidebar, TopBar } from "@/components/app-shell"
import { CoursesDashboard } from "@/components/courses-dashboard"
import { CourseEditor } from "@/components/course-editor"
import { ReportingDashboard } from "@/components/reporting-dashboard"
import { LearnerCourses } from "@/components/learner-courses"
import { MyCourses } from "@/components/my-courses"
import { CourseDetail } from "@/components/course-detail"
import { LessonPlayer } from "@/components/lesson-player"
import { QuizUI } from "@/components/quiz-ui"
import { ProfilePage } from "@/components/profile-page"

type Page =
  | "courses-dashboard"
  | "course-editor"
  | "reporting"
  | "learner-courses"
  | "my-courses"
  | "course-detail"
  | "lesson-player"
  | "quiz"
  | "profile"

export default function Home() {
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState<Page>("courses-dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null)
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null)

  if (!user) return <LoginForm />

  const defaultPage = user.role === "learner" ? "learner-courses" : "courses-dashboard"

  const navigate = (page: Page, data?: Record<string, string>) => {
    setCurrentPage(page)
    if (data?.courseId) setSelectedCourseId(data.courseId)
    if (data?.lessonId) setSelectedLessonId(data.lessonId)
    if (data?.quizId) setSelectedQuizId(data.quizId)
    if (data?.editCourseId) setEditingCourseId(data.editCourseId)
    setSidebarOpen(false)
  }

  const activePage = currentPage === "courses-dashboard" && user.role === "learner" ? defaultPage : currentPage
  const resolvedPage = activePage === "learner-courses" && (user.role === "admin" || user.role === "instructor") ? "courses-dashboard" : activePage

  const renderPage = () => {
    switch (resolvedPage) {
      case "courses-dashboard":
        return <CoursesDashboard onNavigate={navigate} />
      case "course-editor":
        return <CourseEditor courseId={editingCourseId} onNavigate={navigate} />
      case "reporting":
        return <ReportingDashboard />
      case "learner-courses":
        return <LearnerCourses onNavigate={navigate} />
      case "my-courses":
        return <MyCourses onNavigate={navigate} />
      case "course-detail":
        return <CourseDetail courseId={selectedCourseId} onNavigate={navigate} />
      case "lesson-player":
        return (
          <LessonPlayer
            courseId={selectedCourseId}
            lessonId={selectedLessonId}
            onNavigate={navigate}
          />
        )
      case "quiz":
        return (
          <QuizUI
            courseId={selectedCourseId}
            quizId={selectedQuizId}
            onNavigate={navigate}
          />
        )
      case "profile":
        return <ProfilePage />
      default:
        return <CoursesDashboard onNavigate={navigate} />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        currentPage={resolvedPage}
        onNavigate={(page) => navigate(page)}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} onNavigate={navigate} />
        <main className="flex-1 overflow-y-auto">{renderPage()}</main>
      </div>
    </div>
  )
}
