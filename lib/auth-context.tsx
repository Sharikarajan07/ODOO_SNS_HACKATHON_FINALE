"use client"

import React from "react"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { User, Course, QuizAttempt } from "./types"
import { DEMO_USERS, DEMO_COURSES, DEMO_QUIZ_ATTEMPTS } from "./data"

interface AuthContextType {
  user: User | null
  users: User[]
  courses: Course[]
  quizAttempts: QuizAttempt[]
  login: (email: string, password: string) => boolean
  logout: () => void
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
  setQuizAttempts: React.Dispatch<React.SetStateAction<QuizAttempt[]>>
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>(DEMO_USERS)
  const [courses, setCourses] = useState<Course[]>(DEMO_COURSES)
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>(DEMO_QUIZ_ATTEMPTS)

  const login = useCallback((email: string, _password: string) => {
    const found = users.find((u) => u.email === email)
    if (found) {
      setUser(found)
      return true
    }
    return false
  }, [users])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const updateUser = useCallback((updatedUser: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)))
    setUser((prev) => (prev?.id === updatedUser.id ? updatedUser : prev))
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, users, courses, quizAttempts, login, logout, setCourses, setUsers, setQuizAttempts, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
