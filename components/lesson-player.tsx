"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  PlayCircle,
  FileText,
  ImageIcon,
  Video,
  Clock,
  Paperclip,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

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

interface Props {
  courseId: string | null
  lessonId: string | null
  onNavigate: (page: Page, data?: Record<string, string>) => void
}

export function LessonPlayer({ courseId, lessonId, onNavigate }: Props) {
  const { user, courses, setCourses, updateUser } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const course = courses.find((c) => c.id === courseId)
  if (!course) {
    return <div className="flex items-center justify-center p-16"><p className="text-muted-foreground">Course not found</p></div>
  }

  const currentLesson = course.lessons.find((l) => l.id === lessonId) || course.lessons[0]
  const enrollment = course.enrollments.find((e) => e.userId === user?.id)
  const currentIdx = course.lessons.findIndex((l) => l.id === currentLesson?.id)
  const prevLesson = currentIdx > 0 ? course.lessons[currentIdx - 1] : null
  const nextLesson = currentIdx < course.lessons.length - 1 ? course.lessons[currentIdx + 1] : null

  const isCompleted = enrollment?.completedLessons.includes(currentLesson?.id || "")

  const completeLesson = () => {
    if (!enrollment || !currentLesson || isCompleted) return
    const newCompletedLessons = [...enrollment.completedLessons, currentLesson.id]
    const newProgress = Math.round((newCompletedLessons.length / course.lessons.length) * 100)
    const isNowComplete = newProgress === 100

    setCourses((prev) =>
      prev.map((c) =>
        c.id === course.id
          ? {
              ...c,
              enrollments: c.enrollments.map((e) =>
                e.userId === user?.id
                  ? {
                      ...e,
                      completedLessons: newCompletedLessons,
                      progress: newProgress,
                      status: isNowComplete ? ("completed" as const) : ("active" as const),
                      completedAt: isNowComplete ? new Date().toISOString() : undefined,
                    }
                  : e
              ),
            }
          : c
      )
    )

    if (user) {
      const newPoints = user.points + 10
      updateUser({ ...user, points: newPoints })
      toast.success("Lesson completed! +10 points")
    }

    if (isNowComplete) {
      toast.success("Congratulations! You completed the entire course!")
    }
  }

  const LessonIcon = currentLesson?.type === "video" ? Video : currentLesson?.type === "document" ? FileText : ImageIcon

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col lg:flex-row">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex w-full flex-col border-r border-border bg-card transition-all lg:w-80",
          sidebarOpen ? "flex" : "hidden lg:flex lg:w-12"
        )}
      >
        {sidebarOpen ? (
          <>
            <div className="flex items-center justify-between border-b border-border p-3">
              <Button variant="ghost" size="sm" onClick={() => onNavigate("course-detail", { courseId: course.id })}>
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
              </Button>
              <button type="button" onClick={() => setSidebarOpen(false)} className="lg:block hidden text-muted-foreground" aria-label="Collapse sidebar">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-3 border-b border-border">
              <h2 className="text-sm font-semibold text-card-foreground line-clamp-1">{course.title}</h2>
              {enrollment && (
                <div className="mt-2 flex items-center gap-2">
                  <Progress value={enrollment.progress} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground">{enrollment.progress}%</span>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              {course.lessons.map((lesson, idx) => {
                const done = enrollment?.completedLessons.includes(lesson.id)
                const active = lesson.id === currentLesson?.id
                const Icon = lesson.type === "video" ? Video : lesson.type === "document" ? FileText : ImageIcon
                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => onNavigate("lesson-player", { courseId: course.id, lessonId: lesson.id })}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-3 text-left transition-colors border-l-2",
                      active
                        ? "bg-primary/5 border-l-primary text-card-foreground"
                        : "border-l-transparent hover:bg-secondary/50 text-muted-foreground"
                    )}
                  >
                    {done ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[hsl(var(--accent))]" />
                    ) : (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border text-xs">
                        {idx + 1}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium line-clamp-1">{lesson.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Icon className="h-2.5 w-2.5" /> {lesson.duration}m
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="hidden lg:flex h-full items-start justify-center pt-4 text-muted-foreground hover:text-foreground"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {!sidebarOpen && (
          <div className="flex items-center border-b border-border px-4 py-2 lg:hidden">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
              View Lessons
            </Button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl p-4 lg:p-8">
            {/* Lesson content area */}
            <div className="mb-6 flex aspect-video items-center justify-center rounded-xl bg-foreground/5 border border-border">
              {currentLesson?.type === "video" ? (
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <PlayCircle className="h-16 w-16" />
                  <p className="text-sm">Video Player</p>
                  <p className="text-xs">Content would load from: {currentLesson.contentUrl}</p>
                </div>
              ) : currentLesson?.type === "document" ? (
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <FileText className="h-16 w-16" />
                  <p className="text-sm">Document Viewer</p>
                  <p className="text-xs">{currentLesson.title}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <ImageIcon className="h-16 w-16" />
                  <p className="text-sm">Image Content</p>
                </div>
              )}
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <LessonIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">{currentLesson?.type}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> {currentLesson?.duration}m
                </span>
              </div>
              <h1 className="text-xl font-bold text-foreground">{currentLesson?.title}</h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{currentLesson?.description}</p>
            </div>

            {currentLesson?.attachments && currentLesson.attachments.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-2 text-sm font-medium text-foreground">Attachments</h3>
                <div className="flex flex-wrap gap-2">
                  {currentLesson.attachments.map((att) => (
                    <span key={att.id} className="flex items-center gap-1.5 rounded-md border border-border bg-secondary/50 px-3 py-1.5 text-xs text-secondary-foreground">
                      <Paperclip className="h-3 w-3" /> {att.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {!isCompleted && enrollment && (
              <Button onClick={completeLesson} className="bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]">
                <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Complete
              </Button>
            )}
            {isCompleted && (
              <div className="flex items-center gap-2 rounded-lg bg-[hsl(var(--accent))]/10 p-3 text-sm text-[hsl(var(--accent))]">
                <CheckCircle2 className="h-4 w-4" /> Lesson completed
              </div>
            )}
          </div>
        </div>

        {/* Navigation footer */}
        <div className="flex items-center justify-between border-t border-border bg-card px-4 py-3">
          <Button
            variant="ghost"
            disabled={!prevLesson}
            onClick={() => prevLesson && onNavigate("lesson-player", { courseId: course.id, lessonId: prevLesson.id })}
          >
            <ChevronLeft className="mr-1.5 h-4 w-4" /> Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            {currentIdx + 1} / {course.lessons.length}
          </span>
          <Button
            variant="ghost"
            disabled={!nextLesson}
            onClick={() => nextLesson && onNavigate("lesson-player", { courseId: course.id, lessonId: nextLesson.id })}
          >
            Next <ChevronRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
