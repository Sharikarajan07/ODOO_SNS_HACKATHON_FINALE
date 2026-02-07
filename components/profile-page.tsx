"use client"

import React from "react"

import { useAuth } from "@/lib/auth-context"
import { DEMO_BADGES } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Trophy,
  Star,
  BookOpen,
  Brain,
  Footprints,
  Award,
  Lock,
} from "lucide-react"

const BADGE_ICONS: Record<string, React.ElementType> = {
  footprints: Footprints,
  brain: Brain,
  trophy: Trophy,
  "book-open": BookOpen,
  star: Star,
}

export function ProfilePage() {
  const { user, courses, quizAttempts } = useAuth()

  if (!user) return null

  const enrolledCourses = courses.filter((c) =>
    c.enrollments.some((e) => e.userId === user.id)
  )
  const completedCourses = enrolledCourses.filter((c) =>
    c.enrollments.some((e) => e.userId === user.id && e.status === "completed")
  )
  const myAttempts = quizAttempts.filter((a) => a.userId === user.id)
  const avgScore =
    myAttempts.length > 0
      ? Math.round(
          myAttempts.reduce((sum, a) => sum + a.score, 0) / myAttempts.length
        )
      : 0

  const allBadges = DEMO_BADGES
  const earnedBadgeIds = new Set(user.badges.map((b) => b.id))

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-full bg-[hsl(var(--warning))]/10 px-3 py-1 text-sm font-semibold text-[hsl(var(--warning))]">
                <Trophy className="h-3.5 w-3.5" />
                {user.points} points
              </div>
              <Badge variant="secondary" className="capitalize">
                {user.role}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col items-center p-4 text-center">
            <p className="text-3xl font-bold text-primary">{user.points}</p>
            <p className="text-xs text-muted-foreground">Total Points</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center p-4 text-center">
            <p className="text-3xl font-bold text-card-foreground">{enrolledCourses.length}</p>
            <p className="text-xs text-muted-foreground">Courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center p-4 text-center">
            <p className="text-3xl font-bold text-[hsl(var(--accent))]">{completedCourses.length}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center p-4 text-center">
            <p className="text-3xl font-bold text-[hsl(var(--warning))]">{avgScore}%</p>
            <p className="text-xs text-muted-foreground">Avg Quiz Score</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Badges</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {allBadges.map((badge) => {
            const earned = earnedBadgeIds.has(badge.id)
            const IconComponent = BADGE_ICONS[badge.icon] || Award
            return (
              <Card
                key={badge.id}
                className={earned ? "" : "opacity-50"}
              >
                <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-full ${
                      earned
                        ? "bg-[hsl(var(--warning))]/10"
                        : "bg-muted"
                    }`}
                  >
                    {earned ? (
                      <IconComponent className="h-7 w-7 text-[hsl(var(--warning))]" />
                    ) : (
                      <Lock className="h-7 w-7 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-card-foreground">{badge.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{badge.description}</p>
                  {earned && (
                    <Badge variant="secondary" className="text-xs bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]">
                      Earned
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {myAttempts.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Quiz History</h2>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Quiz</th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Score</th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {myAttempts.map((attempt) => {
                    const c = courses.find((co) => co.id === attempt.courseId)
                    const q = c?.quizzes.find((qz) => qz.id === attempt.quizId)
                    return (
                      <tr key={attempt.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 text-sm text-card-foreground">{q?.title || "Unknown"}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-sm font-medium ${
                              attempt.score >= (q?.passingScore || 70)
                                ? "text-[hsl(var(--accent))]"
                                : "text-destructive"
                            }`}
                          >
                            {attempt.score}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {new Date(attempt.completedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
