"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  BookOpen,
  LayoutDashboard,
  GraduationCap,
  BarChart3,
  LogOut,
  Menu,
  X,
  Trophy,
  Library,
  PlusCircle,
} from "lucide-react"
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

interface AppShellProps {
  currentPage: Page
  onNavigate: (page: Page, data?: Record<string, string>) => void
}

export function AppShell({ currentPage, onNavigate }: AppShellProps) {
  return null
}

export function Sidebar({
  currentPage,
  onNavigate,
  open,
  onClose,
}: {
  currentPage: Page
  onNavigate: (page: Page) => void
  open: boolean
  onClose: () => void
}) {
  const { user } = useAuth()
  const isAdmin = user?.role === "admin" || user?.role === "instructor"

  const adminNav = [
    { page: "courses-dashboard" as Page, label: "Courses", icon: LayoutDashboard },
    { page: "course-editor" as Page, label: "New Course", icon: PlusCircle },
    { page: "reporting" as Page, label: "Reporting", icon: BarChart3 },
  ]

  const learnerNav = [
    { page: "learner-courses" as Page, label: "Browse Courses", icon: Library },
    { page: "my-courses" as Page, label: "My Courses", icon: GraduationCap },
    { page: "profile" as Page, label: "Achievements", icon: Trophy },
  ]

  const nav = isAdmin ? adminNav : learnerNav

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          onKeyDown={(e) => e.key === "Escape" && onClose()}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar-background text-sidebar-foreground transition-transform duration-200 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-3 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <BookOpen className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-sidebar-foreground">LearnSphere</span>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto lg:hidden text-sidebar-foreground"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4">
          <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            {isAdmin ? "Management" : "Learning"}
          </div>
          {nav.map((item) => (
            <button
              key={item.page}
              type="button"
              onClick={() => {
                onNavigate(item.page)
                onClose()
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                currentPage === item.page
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                {user?.name?.split(" ").map((n) => n[0]).join("") || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.name}</p>
              <p className="truncate text-xs text-sidebar-foreground/50 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export function TopBar({
  onMenuClick,
  onNavigate,
}: {
  onMenuClick: () => void
  onNavigate: (page: Page) => void
}) {
  const { user, logout } = useAuth()

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="lg:hidden text-foreground"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        {user?.role === "learner" && (
          <div className="hidden items-center gap-1.5 rounded-full bg-[hsl(var(--warning))]/10 px-3 py-1 text-sm font-medium text-[hsl(var(--warning))] sm:flex">
            <Trophy className="h-3.5 w-3.5" />
            {user.points} pts
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {user?.name?.split(" ").map((n) => n[0]).join("") || "?"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            {user?.role === "learner" && (
              <DropdownMenuItem onClick={() => onNavigate("profile")}>
                <Trophy className="mr-2 h-4 w-4" />
                Achievements
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
