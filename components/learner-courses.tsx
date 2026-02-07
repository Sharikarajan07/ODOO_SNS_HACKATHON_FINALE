"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Star, BookOpen, Users, Clock } from "lucide-react"
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
  onNavigate: (page: Page, data?: Record<string, string>) => void
}

export function LearnerCourses({ onNavigate }: Props) {
  const { user, courses, setCourses } = useAuth()
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const publishedCourses = courses.filter((c) => c.status === "published" && c.visibility === "public")
  const categories = ["All", ...Array.from(new Set(publishedCourses.map((c) => c.category)))]

  const filtered = publishedCourses.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase())
    const matchCategory = selectedCategory === "All" || c.category === selectedCategory
    return matchSearch && matchCategory
  })

  const isEnrolled = (courseId: string) => {
    return courses.some((c) => c.id === courseId && c.enrollments.some((e) => e.userId === user?.id))
  }

  const enroll = (courseId: string) => {
    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId
          ? {
              ...c,
              enrollments: [
                ...c.enrollments,
                {
                  id: `e-${Date.now()}`,
                  userId: user!.id,
                  courseId,
                  status: "active" as const,
                  progress: 0,
                  completedLessons: [],
                  enrolledAt: new Date().toISOString(),
                },
              ],
            }
          : c
      )
    )
    toast.success("Successfully enrolled! Start learning now.")
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Browse Courses</h1>
        <p className="text-sm text-muted-foreground">Discover courses to expand your knowledge</p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((course) => {
          const enrolled = isEnrolled(course.id)
          const enrollment = course.enrollments.find((e) => e.userId === user?.id)
          const totalDuration = course.lessons.reduce((sum, l) => sum + l.duration, 0)

          return (
            <Card key={course.id} className="overflow-hidden transition-shadow hover:shadow-lg">
              <div className="relative h-40 bg-primary/5">
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-primary/20" />
                </div>
                <div className="absolute top-3 left-3">
                  <Badge variant="secondary" className="bg-card/90 text-card-foreground backdrop-blur-sm">{course.category}</Badge>
                </div>
                {course.averageRating > 0 && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-card/90 px-2 py-0.5 backdrop-blur-sm">
                    <Star className="h-3 w-3 fill-[hsl(var(--warning))] text-[hsl(var(--warning))]" />
                    <span className="text-xs font-medium text-card-foreground">{course.averageRating}</span>
                  </div>
                )}
              </div>
              <CardContent className="flex flex-col gap-3 p-4">
                <div>
                  <h3 className="text-base font-semibold leading-tight text-card-foreground line-clamp-2">{course.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">by {course.instructorName}</p>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {course.lessons.length} lessons</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {totalDuration}m</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {course.enrollments.length}</span>
                </div>
                {enrolled ? (
                  <div className="flex items-center gap-2">
                    <Button
                      className="flex-1 bg-primary text-primary-foreground"
                      onClick={() => onNavigate("course-detail", { courseId: course.id })}
                    >
                      {enrollment?.status === "completed" ? "Review" : "Continue Learning"}
                    </Button>
                    <div className="text-right">
                      <p className="text-xs font-medium text-primary">{enrollment?.progress || 0}%</p>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => enroll(course.id)}
                  >
                    Enroll Now
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <h3 className="text-lg font-semibold text-foreground">No courses found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}
