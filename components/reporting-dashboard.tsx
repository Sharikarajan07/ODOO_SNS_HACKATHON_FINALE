"use client"

import { useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts"
import {
  Users,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Award,
  Clock,
  Star,
  Target,
} from "lucide-react"

const COLORS = {
  primary: "#2563eb",
  accent: "#16a34a",
  warning: "#f59e0b",
  muted: "#94a3b8",
  destructive: "#ef4444",
  secondary: "#6366f1",
}

export function ReportingDashboard() {
  const { user, courses, users, quizAttempts } = useAuth()

  const stats = useMemo(() => {
    const allCourses = user?.role === "admin"
      ? courses
      : courses.filter((c) => c.instructorId === user?.id)

    const publishedCourses = allCourses.filter((c) => c.status === "published")
    const totalEnrollments = allCourses.reduce((sum, c) => sum + c.enrollments.length, 0)
    const completedEnrollments = allCourses.reduce(
      (sum, c) => sum + c.enrollments.filter((e) => e.status === "completed").length,
      0
    )
    const totalLessons = allCourses.reduce((sum, c) => sum + c.lessons.length, 0)
    const totalDuration = allCourses.reduce(
      (sum, c) => sum + c.lessons.reduce((s, l) => s + l.duration, 0),
      0
    )
    const avgRating = publishedCourses.filter((c) => c.averageRating > 0).length > 0
      ? publishedCourses.filter((c) => c.averageRating > 0).reduce((s, c) => s + c.averageRating, 0) /
        publishedCourses.filter((c) => c.averageRating > 0).length
      : 0
    const completionRate = totalEnrollments > 0
      ? Math.round((completedEnrollments / totalEnrollments) * 100)
      : 0

    return {
      allCourses,
      publishedCourses,
      totalEnrollments,
      completedEnrollments,
      totalLessons,
      totalDuration,
      avgRating,
      completionRate,
    }
  }, [user, courses])

  const enrollmentTrendData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return months.map((month, idx) => {
      const monthNum = idx + 1
      const enrollments = stats.allCourses.reduce((sum, c) => {
        return sum + c.enrollments.filter((e) => {
          const d = new Date(e.enrolledAt)
          return d.getMonth() + 1 === monthNum
        }).length
      }, 0)
      const completions = stats.allCourses.reduce((sum, c) => {
        return sum + c.enrollments.filter((e) => {
          if (!e.completedAt) return false
          const d = new Date(e.completedAt)
          return d.getMonth() + 1 === monthNum
        }).length
      }, 0)
      return { month, enrollments, completions }
    })
  }, [stats.allCourses])

  const coursePerformanceData = useMemo(() => {
    return stats.allCourses
      .filter((c) => c.enrollments.length > 0)
      .map((c) => {
        const completed = c.enrollments.filter((e) => e.status === "completed").length
        const active = c.enrollments.filter((e) => e.status === "active").length
        const avgProgress = c.enrollments.reduce((s, e) => s + e.progress, 0) / c.enrollments.length
        return {
          name: c.title.length > 20 ? `${c.title.slice(0, 20)}...` : c.title,
          fullName: c.title,
          completed,
          active,
          avgProgress: Math.round(avgProgress),
        }
      })
  }, [stats.allCourses])

  const quizPerformanceData = useMemo(() => {
    const ranges = [
      { range: "0-20%", min: 0, max: 20 },
      { range: "21-40%", min: 21, max: 40 },
      { range: "41-60%", min: 41, max: 60 },
      { range: "61-80%", min: 61, max: 80 },
      { range: "81-100%", min: 81, max: 100 },
    ]
    return ranges.map((r) => ({
      range: r.range,
      count: quizAttempts.filter((a) => a.score >= r.min && a.score <= r.max).length,
    }))
  }, [quizAttempts])

  const categoryDistribution = useMemo(() => {
    const catMap: Record<string, number> = {}
    for (const c of stats.allCourses) {
      catMap[c.category] = (catMap[c.category] || 0) + 1
    }
    const pieColors = [COLORS.primary, COLORS.accent, COLORS.warning, COLORS.secondary, COLORS.destructive, COLORS.muted]
    return Object.entries(catMap).map(([name, value], idx) => ({
      name,
      value,
      fill: pieColors[idx % pieColors.length],
    }))
  }, [stats.allCourses])

  const topLearners = useMemo(() => {
    return users
      .filter((u) => u.role === "learner")
      .sort((a, b) => b.points - a.points)
      .slice(0, 5)
  }, [users])

  const statCards = [
    { label: "Total Courses", value: stats.allCourses.length, icon: BookOpen, color: COLORS.primary },
    { label: "Total Enrollments", value: stats.totalEnrollments, icon: Users, color: COLORS.accent },
    { label: "Completion Rate", value: `${stats.completionRate}%`, icon: GraduationCap, color: COLORS.warning },
    { label: "Avg Rating", value: stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "N/A", icon: Star, color: COLORS.secondary },
    { label: "Total Lessons", value: stats.totalLessons, icon: Target, color: COLORS.destructive },
    { label: "Content Hours", value: `${Math.round(stats.totalDuration / 60)}h`, icon: Clock, color: COLORS.muted },
  ]

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Reporting</h1>
        <p className="text-sm text-muted-foreground">
          Analytics and insights for your courses
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
              </div>
              <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Enrollment Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Enrollment Trends
            </CardTitle>
            <CardDescription>Monthly enrollments and completions</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                enrollments: { label: "Enrollments", color: COLORS.primary },
                completions: { label: "Completions", color: COLORS.accent },
              }}
              className="h-[280px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={enrollmentTrendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="enrollments"
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    dot={{ r: 3, fill: COLORS.primary }}
                    name="Enrollments"
                  />
                  <Line
                    type="monotone"
                    dataKey="completions"
                    stroke={COLORS.accent}
                    strokeWidth={2}
                    dot={{ r: 3, fill: COLORS.accent }}
                    name="Completions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Course Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4 text-primary" />
              Course Performance
            </CardTitle>
            <CardDescription>Enrollments by status per course</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                completed: { label: "Completed", color: COLORS.accent },
                active: { label: "Active", color: COLORS.primary },
              }}
              className="h-[280px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={coursePerformanceData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="completed" fill={COLORS.accent} radius={[4, 4, 0, 0]} name="Completed" />
                  <Bar dataKey="active" fill={COLORS.primary} radius={[4, 4, 0, 0]} name="Active" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quiz Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-primary" />
              Quiz Scores
            </CardTitle>
            <CardDescription>Distribution of quiz scores</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: { label: "Attempts", color: COLORS.primary },
              }}
              className="h-[240px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quizPerformanceData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Attempts">
                    {quizPerformanceData.map((entry, index) => {
                      const barColors = [COLORS.destructive, COLORS.warning, COLORS.warning, COLORS.primary, COLORS.accent]
                      return <Cell key={`cell-${entry.range}`} fill={barColors[index]} />
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4 text-primary" />
              Categories
            </CardTitle>
            <CardDescription>Course distribution by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={Object.fromEntries(
                categoryDistribution.map((c) => [c.name, { label: c.name, color: c.fill }])
              )}
              className="h-[240px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                  >
                    {categoryDistribution.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              {categoryDistribution.map((cat) => (
                <div key={cat.name} className="flex items-center gap-1.5 text-xs">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.fill }} />
                  <span className="text-muted-foreground">{cat.name}</span>
                  <span className="font-medium text-card-foreground">{cat.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Learners */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="h-4 w-4 text-primary" />
              Top Learners
            </CardTitle>
            <CardDescription>Leaderboard by points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {topLearners.map((learner, idx) => {
                const enrolledCount = courses.filter((c) =>
                  c.enrollments.some((e) => e.userId === learner.id)
                ).length
                const completedCount = courses.filter((c) =>
                  c.enrollments.some((e) => e.userId === learner.id && e.status === "completed")
                ).length
                return (
                  <div key={learner.id} className="flex items-center gap-3">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: idx === 0 ? `${COLORS.warning}20` : idx === 1 ? `${COLORS.muted}20` : `${COLORS.warning}10`,
                        color: idx === 0 ? COLORS.warning : idx === 1 ? COLORS.muted : COLORS.warning,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {learner.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground truncate">{learner.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {enrolledCount} courses - {completedCount} completed
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {learner.points} pts
                    </Badge>
                  </div>
                )
              })}
              {topLearners.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">No learners yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Details Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Course Analytics</CardTitle>
          <CardDescription>Detailed breakdown per course</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Course</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Enrolled</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Completed</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Avg Progress</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Rating</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Lessons</th>
                </tr>
              </thead>
              <tbody>
                {stats.allCourses.map((course) => {
                  const enrolled = course.enrollments.length
                  const completed = course.enrollments.filter((e) => e.status === "completed").length
                  const avgProgress = enrolled > 0
                    ? Math.round(course.enrollments.reduce((s, e) => s + e.progress, 0) / enrolled)
                    : 0
                  return (
                    <tr key={course.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-card-foreground">{course.title}</p>
                          <p className="text-xs text-muted-foreground">{course.category}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={course.status === "published" ? "default" : "secondary"}
                          className={course.status === "published" ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]" : ""}
                        >
                          {course.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{enrolled}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{completed}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 rounded-full bg-secondary">
                            <div
                              className="h-2 rounded-full bg-primary"
                              style={{ width: `${avgProgress}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{avgProgress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {course.averageRating > 0 ? (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-[hsl(var(--warning))] text-[hsl(var(--warning))]" />
                            {course.averageRating}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{course.lessons.length}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
