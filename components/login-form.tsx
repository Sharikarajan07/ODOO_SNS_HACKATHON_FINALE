"use client"

import React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { BookOpen } from "lucide-react"

export function LoginForm() {
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const success = login(email, password)
    if (success) {
      toast.success("Welcome back to LearnSphere!")
    } else {
      toast.error("Invalid credentials. Try one of the demo accounts.")
    }
  }

  const quickLogin = (email: string) => {
    setEmail(email)
    login(email, "demo")
    toast.success("Welcome back to LearnSphere!")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="flex w-full max-w-4xl flex-col items-center gap-8 lg:flex-row lg:gap-16">
        <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">LearnSphere</h1>
          </div>
          <p className="mb-8 max-w-md text-lg leading-relaxed text-muted-foreground">
            A modern eLearning platform where instructors create engaging courses and learners unlock their potential.
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <p className="text-sm font-medium text-muted-foreground">Quick demo access:</p>
            <button
              type="button"
              onClick={() => quickLogin("admin@learnsphere.com")}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-secondary"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-sm font-bold text-primary">A</div>
              <div>
                <p className="text-sm font-medium text-card-foreground">Admin</p>
                <p className="text-xs text-muted-foreground">admin@learnsphere.com</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => quickLogin("instructor@learnsphere.com")}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-secondary"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[hsl(var(--accent))]/10 text-sm font-bold text-[hsl(var(--accent))]">I</div>
              <div>
                <p className="text-sm font-medium text-card-foreground">Instructor</p>
                <p className="text-xs text-muted-foreground">instructor@learnsphere.com</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => quickLogin("learner@learnsphere.com")}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-secondary"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[hsl(var(--warning))]/10 text-sm font-bold text-[hsl(var(--warning))]">L</div>
              <div>
                <p className="text-sm font-medium text-card-foreground">Learner</p>
                <p className="text-xs text-muted-foreground">learner@learnsphere.com</p>
              </div>
            </button>
          </div>
        </div>
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>Enter your credentials to access LearnSphere</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter any password for demo"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
