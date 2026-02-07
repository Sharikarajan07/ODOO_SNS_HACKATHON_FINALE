"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import type { QuizAttempt } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DEMO_BADGES } from "@/lib/data"
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Trophy,
  Target,
  Award,
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
  quizId: string | null
  onNavigate: (page: Page, data?: Record<string, string>) => void
}

export function QuizUI({ courseId, quizId, onNavigate }: Props) {
  const { user, courses, quizAttempts, setQuizAttempts, updateUser } = useAuth()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  const course = courses.find((c) => c.id === courseId)
  const quiz = course?.quizzes.find((q) => q.id === quizId)

  if (!course || !quiz) {
    return (
      <div className="flex items-center justify-center p-16">
        <p className="text-muted-foreground">Quiz not found</p>
      </div>
    )
  }

  const previousAttempts = quizAttempts.filter(
    (a) => a.quizId === quiz.id && a.userId === user?.id
  )
  const canAttempt = previousAttempts.length < quiz.maxAttempts

  const question = quiz.questions[currentQuestion]
  const totalQuestions = quiz.questions.length
  const progressPercent = ((currentQuestion + 1) / totalQuestions) * 100

  const selectAnswer = (optionId: string) => {
    if (submitted) return
    setAnswers({ ...answers, [question.id]: optionId })
  }

  const submitQuiz = () => {
    let correct = 0
    for (const q of quiz.questions) {
      if (answers[q.id] === q.correctOptionId) correct++
    }
    const pct = Math.round((correct / totalQuestions) * 100)
    setScore(pct)
    setSubmitted(true)

    const attempt: QuizAttempt = {
      id: `qa-${Date.now()}`,
      quizId: quiz.id,
      userId: user!.id,
      courseId: course.id,
      answers,
      score: pct,
      totalQuestions,
      completedAt: new Date().toISOString(),
    }
    setQuizAttempts((prev) => [...prev, attempt])

    // Award points
    const pointsEarned = Math.round(pct / 10) * 5
    if (user) {
      const newPoints = user.points + pointsEarned
      let newBadges = [...user.badges]

      // Check for "Quiz Whiz" badge
      if (pct === 100 && !newBadges.some((b) => b.id === "b2")) {
        const badge = { ...DEMO_BADGES[1], earnedAt: new Date().toISOString() }
        newBadges = [...newBadges, badge]
        toast.success("New badge earned: Quiz Whiz!")
      }

      // Check for "Top Scorer" badge  
      if (newPoints >= 500 && !newBadges.some((b) => b.id === "b5")) {
        const badge = { ...DEMO_BADGES[4], earnedAt: new Date().toISOString() }
        newBadges = [...newBadges, badge]
        toast.success("New badge earned: Top Scorer!")
      }

      updateUser({ ...user, points: newPoints, badges: newBadges })
      toast.success(`Quiz completed! +${pointsEarned} points`)
    }
  }

  if (submitted) {
    const passed = score >= quiz.passingScore
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
            <div
              className={cn(
                "flex h-20 w-20 items-center justify-center rounded-full",
                passed ? "bg-[hsl(var(--accent))]/10" : "bg-destructive/10"
              )}
            >
              {passed ? (
                <Trophy className="h-10 w-10 text-[hsl(var(--accent))]" />
              ) : (
                <Target className="h-10 w-10 text-destructive" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">
                {passed ? "Congratulations!" : "Keep Trying!"}
              </h2>
              <p className="mt-1 text-muted-foreground">
                {passed
                  ? "You passed the quiz!"
                  : `You need ${quiz.passingScore}% to pass.`}
              </p>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{score}%</p>
                <p className="text-xs text-muted-foreground">Score</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-card-foreground">
                  {Object.values(answers).filter((a, i) => a === quiz.questions[i]?.correctOptionId).length}/{totalQuestions}
                </p>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>
            </div>

            {/* Show correct/incorrect breakdown */}
            <div className="w-full flex flex-col gap-2">
              {quiz.questions.map((q, idx) => {
                const userAnswer = answers[q.id]
                const correct = userAnswer === q.correctOptionId
                return (
                  <div key={q.id} className="flex items-center gap-2 rounded-lg border border-border p-2 text-left text-sm">
                    {correct ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[hsl(var(--accent))]" />
                    ) : (
                      <XCircle className="h-4 w-4 shrink-0 text-destructive" />
                    )}
                    <span className="text-xs text-card-foreground line-clamp-1">Q{idx + 1}: {q.text}</span>
                  </div>
                )
              })}
            </div>

            <div className="flex w-full gap-3">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => onNavigate("course-detail", { courseId: course.id })}
              >
                Back to Course
              </Button>
              {canAttempt && !passed && (
                <Button
                  className="flex-1 bg-primary text-primary-foreground"
                  onClick={() => {
                    setSubmitted(false)
                    setAnswers({})
                    setCurrentQuestion(0)
                    setScore(0)
                  }}
                >
                  Retry
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Attempts: {previousAttempts.length + 1}/{quiz.maxAttempts}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!canAttempt) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <Award className="h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-bold text-card-foreground">No Attempts Remaining</h2>
            <p className="text-sm text-muted-foreground">
              You have used all {quiz.maxAttempts} attempts for this quiz.
              Best score: {Math.max(...previousAttempts.map((a) => a.score))}%
            </p>
            <Button onClick={() => onNavigate("course-detail", { courseId: course.id })}>
              Back to Course
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => onNavigate("course-detail", { courseId: course.id })}>
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Exit Quiz
          </Button>
          <div className="text-center">
            <p className="text-sm font-semibold text-card-foreground">{quiz.title}</p>
            <p className="text-xs text-muted-foreground">Question {currentQuestion + 1} of {totalQuestions}</p>
          </div>
          <div className="w-20" />
        </div>
        <div className="mx-auto mt-2 max-w-2xl">
          <Progress value={progressPercent} className="h-1.5" />
        </div>
      </div>

      {/* Question */}
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Question {currentQuestion + 1}
          </div>
          <h2 className="mb-8 text-xl font-bold text-foreground lg:text-2xl">{question.text}</h2>
          <div className="flex flex-col gap-3">
            {question.options.map((opt) => {
              const selected = answers[question.id] === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => selectAnswer(opt.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all",
                    selected
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border bg-card text-card-foreground hover:border-primary/50 hover:bg-primary/5"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground"
                    )}
                  >
                    {String.fromCharCode(65 + question.options.indexOf(opt))}
                  </span>
                  <span className="text-sm font-medium">{opt.text}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Button
            variant="ghost"
            disabled={currentQuestion === 0}
            onClick={() => setCurrentQuestion((p) => p - 1)}
          >
            <ChevronLeft className="mr-1.5 h-4 w-4" /> Previous
          </Button>
          {currentQuestion < totalQuestions - 1 ? (
            <Button
              disabled={!answers[question.id]}
              onClick={() => setCurrentQuestion((p) => p + 1)}
              className="bg-primary text-primary-foreground"
            >
              Next <ChevronRight className="ml-1.5 h-4 w-4" />
            </Button>
          ) : (
            <Button
              disabled={Object.keys(answers).length < totalQuestions}
              onClick={submitQuiz}
              className="bg-primary text-primary-foreground"
            >
              Submit Quiz
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
