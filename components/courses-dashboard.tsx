"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import type { Course } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  LayoutGrid,
  List,
  Search,
  Users,
  BookOpen,
  Star,
  MoreVertical,
  Eye,
  Pencil,
  Archive,
  Globe,
  Lock,
  Send,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  onNavigate: (page: Page, data?: Record<string, string>) => void
}

export function CoursesDashboard({ onNavigate }: Props) {
  const { user, courses, setCourses } = useAuth()
  const [view, setView] = useState<"kanban" | "list">("kanban")
  const [search, setSearch] = useState("")

  const myCourses =
    user?.role === "admin"
      ? courses
      : courses.filter((c) => c.instructorId === user?.id)

  const filtered = myCourses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase())
  )

  const togglePublish = (course: Course) => {
    const newStatus = course.status === "published" ? "draft" : "published"
    setCourses((prev) =>
      prev.map((c) => (c.id === course.id ? { ...c, status: newStatus } : c))
    )
    toast.success(`Course ${newStatus === "published" ? "published" : "unpublished"}`)
  }

  const archiveCourse = (course: Course) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === course.id ? { ...c, status: "archived" } : c))
    )
    toast.success("Course archived")
  }

  const statCards = [
    { label: "Total Courses", value: myCourses.length, icon: BookOpen },
    { label: "Published", value: myCourses.filter((c) => c.status === "published").length, icon: Globe },
    { label: "Total Learners", value: myCourses.reduce((sum, c) => sum + c.enrollments.length, 0), icon: Users },
    { label: "Avg Rating", value: (myCourses.filter((c) => c.averageRating > 0).reduce((sum, c) => sum + c.averageRating, 0) / Math.max(myCourses.filter((c) => c.averageRating > 0).length, 1)).toFixed(1), icon: Star },
  ]

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Courses</h1>
          <p className="text-sm text-muted-foreground">Manage and organize your courses</p>
        </div>
        <Button onClick={() => onNavigate("course-editor")} className="bg-primary text-primary-foreground">
          Create Course
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center rounded-lg border border-border bg-card">
          <button
            type="button"
            onClick={() => setView("kanban")}
            className={cn(
              "flex items-center gap-1.5 rounded-l-lg px-3 py-2 text-sm",
              view === "kanban"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Board</span>
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={cn(
              "flex items-center gap-1.5 rounded-r-lg px-3 py-2 text-sm",
              view === "list"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>
      </div>

      {view === "kanban" ? (
        <KanbanView courses={filtered} onNavigate={onNavigate} onTogglePublish={togglePublish} onArchive={archiveCourse} />
      ) : (
        <ListView courses={filtered} onNavigate={onNavigate} onTogglePublish={togglePublish} onArchive={archiveCourse} />
      )}
    </div>
  )
}

function KanbanView({
  courses,
  onNavigate,
  onTogglePublish,
  onArchive,
}: {
  courses: Course[]
  onNavigate: (page: "course-editor" | "course-detail", data?: Record<string, string>) => void
  onTogglePublish: (c: Course) => void
  onArchive: (c: Course) => void
}) {
  const columns = [
    { status: "draft" as const, label: "Draft", color: "bg-[hsl(var(--warning))]" },
    { status: "published" as const, label: "Published", color: "bg-[hsl(var(--accent))]" },
    { status: "archived" as const, label: "Archived", color: "bg-muted-foreground" },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {columns.map((col) => {
        const items = courses.filter((c) => c.status === col.status)
        return (
          <div key={col.status} className="flex flex-col">
            <div className="mb-3 flex items-center gap-2">
              <div className={cn("h-2.5 w-2.5 rounded-full", col.color)} />
              <span className="text-sm font-semibold text-foreground">{col.label}</span>
              <Badge variant="secondary" className="ml-auto">{items.length}</Badge>
            </div>
            <div className="flex flex-col gap-3">
              {items.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onNavigate={onNavigate}
                  onTogglePublish={onTogglePublish}
                  onArchive={onArchive}
                />
              ))}
              {items.length === 0 && (
                <div className="flex items-center justify-center rounded-lg border border-dashed border-border p-8 text-sm text-muted-foreground">
                  No courses
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CourseCard({
  course,
  onNavigate,
  onTogglePublish,
  onArchive,
}: {
  course: Course
  onNavigate: (page: "course-editor" | "course-detail", data?: Record<string, string>) => void
  onTogglePublish: (c: Course) => void
  onArchive: (c: Course) => void
}) {
  const visIcon = course.visibility === "public" ? Globe : course.visibility === "private" ? Lock : Send

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-semibold leading-tight text-card-foreground line-clamp-2">
              {course.title}
            </CardTitle>
            <div className="mt-1.5 flex items-center gap-2">
              <Badge variant="outline" className="text-xs">{course.category}</Badge>
              {React.createElement(visIcon, { className: "h-3 w-3 text-muted-foreground" })}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onNavigate("course-editor", { editCourseId: course.id })}>
                <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTogglePublish(course)}>
                <Eye className="mr-2 h-3.5 w-3.5" /> {course.status === "published" ? "Unpublish" : "Publish"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onArchive(course)}>
                <Archive className="mr-2 h-3.5 w-3.5" /> Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" /> {course.lessons.length} lessons
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" /> {course.enrollments.length}
          </span>
          {course.averageRating > 0 && (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-[hsl(var(--warning))] text-[hsl(var(--warning))]" /> {course.averageRating}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ListView({
  courses,
  onNavigate,
  onTogglePublish,
  onArchive,
}: {
  courses: Course[]
  onNavigate: (page: "course-editor", data?: Record<string, string>) => void
  onTogglePublish: (c: Course) => void
  onArchive: (c: Course) => void
}) {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Course</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Lessons</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Learners</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Rating</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{course.title}</p>
                    <p className="text-xs text-muted-foreground">{course.category} - {course.instructorName}</p>
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
                <td className="px-4 py-3 text-sm text-muted-foreground">{course.lessons.length}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{course.enrollments.length}</td>
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
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => onNavigate("course-editor", { editCourseId: course.id })}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onTogglePublish(course)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onArchive(course)}>
                      <Archive className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

import React from "react"
