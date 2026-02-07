"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock, CheckCircle2, PlayCircle } from "lucide-react"

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
  onNavigate: (page: Page, data?: Record<string, string>) => void
}

export function MyCourses({ onNavigate }: Props) {
  const { user, courses } = useAuth()

  const enrolledCourses = courses
    .filter((c) => c.enrollments.some((e) => e.userId === user?.id))
    .map((c) => {
      const enrollment = c.enrollments.find((e) => e.userId === user?.id)!
      return { course: c, enrollment }
    })

  const inProgress = enrolledCourses.filter((ec) => ec.enrollment.status === "active")
  const completed = enrolledCourses.filter((ec) => ec.enrollment.status === "completed")

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
        <p className="text-sm text-muted-foreground">Track your learning progress</p>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{enrolledCourses.length}</p>
              <p className="text-xs text-muted-foreground">Enrolled</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--warning))]/10">
              <PlayCircle className="h-5 w-5 text-[hsl(var(--warning))]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{inProgress.length}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--accent))]/10">
              <CheckCircle2 className="h-5 w-5 text-[hsl(var(--accent))]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{completed.length}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {inProgress.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-foreground">In Progress</h2>
          <div className="flex flex-col gap-3">
            {inProgress.map(({ course, enrollment }) => {
              const totalDuration = course.lessons.reduce((s, l) => s + l.duration, 0)
              const nextLesson = course.lessons.find((l) => !enrollment.completedLessons.includes(l.id))
              return (
                <Card key={course.id} className="transition-shadow hover:shadow-md">
                  <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-primary/5">
                      <BookOpen className="h-8 w-8 text-primary/30" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-card-foreground">{course.title}</h3>
                      <p className="text-xs text-muted-foreground">{course.instructorName}</p>
                      <div className="mt-2 flex items-center gap-3">
                        <Progress value={enrollment.progress} className="h-2 flex-1" />
                        <span className="text-xs font-medium text-primary">{enrollment.progress}%</span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{enrollment.completedLessons.length}/{course.lessons.length} lessons</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {totalDuration}m total</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground"
                      onClick={() =>
                        nextLesson
                          ? onNavigate("lesson-player", { courseId: course.id, lessonId: nextLesson.id })
                          : onNavigate("course-detail", { courseId: course.id })
                      }
                    >
                      <PlayCircle className="mr-1.5 h-3.5 w-3.5" />
                      {nextLesson ? "Continue" : "View"}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Completed</h2>
          <div className="flex flex-col gap-3">
            {completed.map(({ course, enrollment }) => (
              <Card key={course.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--accent))]/10">
                    <CheckCircle2 className="h-6 w-6 text-[hsl(var(--accent))]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-card-foreground">{course.title}</h3>
                    <p className="text-xs text-muted-foreground">{course.instructorName}</p>
                  </div>
                  <Badge variant="secondary" className="bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]">
                    Completed
                  </Badge>
                  <Button size="sm" variant="ghost" onClick={() => onNavigate("course-detail", { courseId: course.id })}>
                    View
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {enrolledCourses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <h3 className="text-lg font-semibold text-foreground">No courses yet</h3>
          <p className="mb-4 text-sm text-muted-foreground">Browse available courses to start learning</p>
          <Button onClick={() => onNavigate("learner-courses")} className="bg-primary text-primary-foreground">
            Browse Courses
          </Button>
        </div>
      )}
    </div>
  )
}
