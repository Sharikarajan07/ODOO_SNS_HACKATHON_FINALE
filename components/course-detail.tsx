"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Star,
  Users,
  PlayCircle,
  FileText,
  ImageIcon,
  Video,
  CheckCircle2,
  MessageSquare,
  ClipboardCheck,
} from "lucide-react"
import { toast } from "sonner"

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
  onNavigate: (page: Page, data?: Record<string, string>) => void
}

export function CourseDetail({ courseId, onNavigate }: Props) {
  const { user, courses, setCourses } = useAuth()
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState("")

  const course = courses.find((c) => c.id === courseId)
  if (!course) {
    return (
      <div className="flex items-center justify-center p-16">
        <p className="text-muted-foreground">Course not found</p>
      </div>
    )
  }

  const enrollment = course.enrollments.find((e) => e.userId === user?.id)
  const totalDuration = course.lessons.reduce((s, l) => s + l.duration, 0)
  const lessonIcon = (type: string) => {
    if (type === "video") return Video
    if (type === "document") return FileText
    return ImageIcon
  }

  const submitReview = () => {
    if (!newComment.trim()) {
      toast.error("Please write a comment")
      return
    }
    const review = {
      id: `r-${Date.now()}`,
      userId: user!.id,
      userName: user!.name,
      courseId: course.id,
      rating: newRating,
      comment: newComment,
      createdAt: new Date().toISOString(),
    }
    const updatedReviews = [...course.reviews, review]
    const avgRating = updatedReviews.reduce((s, r) => s + r.rating, 0) / updatedReviews.length
    setCourses((prev) =>
      prev.map((c) =>
        c.id === course.id
          ? { ...c, reviews: updatedReviews, averageRating: Math.round(avgRating * 10) / 10 }
          : c
      )
    )
    setNewComment("")
    toast.success("Review submitted!")
  }

  return (
    <div className="p-4 lg:p-6">
      <Button variant="ghost" onClick={() => onNavigate(user?.role === "learner" ? "my-courses" : "courses-dashboard")} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 rounded-xl bg-primary/5 p-8">
            <Badge variant="secondary" className="mb-3">{course.category}</Badge>
            <h1 className="text-2xl font-bold text-foreground lg:text-3xl text-balance">{course.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">by {course.instructorName}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {course.lessons.length} lessons</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {totalDuration}m</span>
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {course.enrollments.length} enrolled</span>
              {course.averageRating > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-[hsl(var(--warning))] text-[hsl(var(--warning))]" /> {course.averageRating}
                </span>
              )}
            </div>
          </div>
          <p className="mb-6 leading-relaxed text-muted-foreground">{course.description}</p>
        </div>

        {enrollment && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Progress</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Progress value={enrollment.progress} className="h-3 flex-1" />
                <span className="text-sm font-bold text-primary">{enrollment.progress}%</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {enrollment.completedLessons.length} of {course.lessons.length} lessons completed
              </div>
              {enrollment.status === "completed" ? (
                <Badge className="w-fit bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]">Course Completed</Badge>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Lessons</h2>
          <div className="flex flex-col gap-2">
            {course.lessons.map((lesson, idx) => {
              const LessonIcon = lessonIcon(lesson.type)
              const completed = enrollment?.completedLessons.includes(lesson.id)
              return (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => {
                    if (enrollment) {
                      onNavigate("lesson-player", { courseId: course.id, lessonId: lesson.id })
                    }
                  }}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-secondary/50"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {completed ? <CheckCircle2 className="h-4 w-4 text-[hsl(var(--accent))]" /> : idx + 1}
                  </span>
                  <LessonIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-card-foreground">{lesson.title}</p>
                    <p className="text-xs text-muted-foreground">{lesson.description}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{lesson.duration}m</span>
                  {enrollment && !completed && (
                    <PlayCircle className="h-4 w-4 shrink-0 text-primary" />
                  )}
                </button>
              )
            })}
          </div>

          {course.quizzes.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Quizzes</h2>
              <div className="flex flex-col gap-3">
                {course.quizzes.map((quiz) => (
                  <Card key={quiz.id} className="transition-shadow hover:shadow-md">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--warning))]/10">
                        <ClipboardCheck className="h-5 w-5 text-[hsl(var(--warning))]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-card-foreground">{quiz.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {quiz.questions.length} questions - Passing: {quiz.passingScore}%
                        </p>
                      </div>
                      {enrollment && (
                        <Button
                          size="sm"
                          className="bg-primary text-primary-foreground"
                          onClick={() => onNavigate("quiz", { courseId: course.id, quizId: quiz.id })}
                        >
                          Take Quiz
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Reviews
          </h2>
          {enrollment && !course.reviews.some((r) => r.userId === user?.id) && (
            <Card className="mb-4">
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-card-foreground">Your rating:</span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setNewRating(s)}
                        aria-label={`Rate ${s} stars`}
                      >
                        <Star
                          className={`h-5 w-5 ${
                            s <= newRating
                              ? "fill-[hsl(var(--warning))] text-[hsl(var(--warning))]"
                              : "text-border"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write your review..."
                />
                <Button size="sm" onClick={submitReview} className="bg-primary text-primary-foreground">
                  Submit Review
                </Button>
              </CardContent>
            </Card>
          )}
          <div className="flex flex-col gap-3">
            {course.reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-card-foreground">{review.userName}</span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={`star-${review.id}-${i}`}
                          className={`h-3 w-3 ${
                            i < review.rating
                              ? "fill-[hsl(var(--warning))] text-[hsl(var(--warning))]"
                              : "text-border"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                </CardContent>
              </Card>
            ))}
            {course.reviews.length === 0 && (
              <p className="text-sm text-muted-foreground">No reviews yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
