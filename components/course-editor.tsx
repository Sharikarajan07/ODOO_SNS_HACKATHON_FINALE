"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import type { Course, Lesson, Quiz, QuizQuestion, QuizOption } from "@/lib/types"
import { CATEGORIES } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Video,
  FileText,
  ImageIcon,
  Save,
  CheckCircle,
  Circle,
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

export function CourseEditor({ courseId, onNavigate }: Props) {
  const { user, courses, setCourses } = useAuth()

  const existingCourse = courseId ? courses.find((c) => c.id === courseId) : null

  const [title, setTitle] = useState(existingCourse?.title || "")
  const [description, setDescription] = useState(existingCourse?.description || "")
  const [category, setCategory] = useState(existingCourse?.category || CATEGORIES[0])
  const [visibility, setVisibility] = useState<"public" | "private" | "invite-only">(
    existingCourse?.visibility || "public"
  )
  const [lessons, setLessons] = useState<Lesson[]>(existingCourse?.lessons || [])
  const [quizzes, setQuizzes] = useState<Quiz[]>(existingCourse?.quizzes || [])

  const addLesson = () => {
    const newLesson: Lesson = {
      id: `l-${Date.now()}`,
      courseId: courseId || "new",
      title: "",
      description: "",
      type: "video",
      contentUrl: "",
      duration: 10,
      order: lessons.length + 1,
      attachments: [],
    }
    setLessons([...lessons, newLesson])
  }

  const updateLesson = (id: string, updates: Partial<Lesson>) => {
    setLessons((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)))
  }

  const removeLesson = (id: string) => {
    setLessons((prev) => prev.filter((l) => l.id !== id))
  }

  const addQuiz = () => {
    const newQuiz: Quiz = {
      id: `q-${Date.now()}`,
      courseId: courseId || "new",
      title: "",
      description: "",
      questions: [],
      maxAttempts: 3,
      passingScore: 70,
    }
    setQuizzes([...quizzes, newQuiz])
  }

  const updateQuiz = (id: string, updates: Partial<Quiz>) => {
    setQuizzes((prev) => prev.map((q) => (q.id === id ? { ...q, ...updates } : q)))
  }

  const removeQuiz = (id: string) => {
    setQuizzes((prev) => prev.filter((q) => q.id !== id))
  }

  const addQuestion = (quizId: string) => {
    const qid = `qq-${Date.now()}`
    const newQ: QuizQuestion = {
      id: qid,
      quizId,
      text: "",
      options: [
        { id: `opt-${Date.now()}-1`, text: "" },
        { id: `opt-${Date.now()}-2`, text: "" },
        { id: `opt-${Date.now()}-3`, text: "" },
        { id: `opt-${Date.now()}-4`, text: "" },
      ],
      correctOptionId: `opt-${Date.now()}-1`,
      order: 0,
    }
    setQuizzes((prev) =>
      prev.map((q) =>
        q.id === quizId
          ? { ...q, questions: [...q.questions, { ...newQ, order: q.questions.length + 1 }] }
          : q
      )
    )
  }

  const updateQuestion = (quizId: string, questionId: string, updates: Partial<QuizQuestion>) => {
    setQuizzes((prev) =>
      prev.map((q) =>
        q.id === quizId
          ? {
              ...q,
              questions: q.questions.map((qq) =>
                qq.id === questionId ? { ...qq, ...updates } : qq
              ),
            }
          : q
      )
    )
  }

  const removeQuestion = (quizId: string, questionId: string) => {
    setQuizzes((prev) =>
      prev.map((q) =>
        q.id === quizId
          ? { ...q, questions: q.questions.filter((qq) => qq.id !== questionId) }
          : q
      )
    )
  }

  const saveCourse = () => {
    if (!title.trim()) {
      toast.error("Course title is required")
      return
    }
    const courseData: Course = {
      id: courseId || `c-${Date.now()}`,
      title,
      description,
      thumbnail: "",
      instructorId: user?.id || "",
      instructorName: user?.name || "",
      status: existingCourse?.status || "draft",
      visibility,
      category,
      lessons,
      quizzes,
      enrollments: existingCourse?.enrollments || [],
      reviews: existingCourse?.reviews || [],
      averageRating: existingCourse?.averageRating || 0,
      createdAt: existingCourse?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    if (courseId) {
      setCourses((prev) => prev.map((c) => (c.id === courseId ? courseData : c)))
    } else {
      setCourses((prev) => [...prev, courseData])
    }
    toast.success(courseId ? "Course updated!" : "Course created!")
    onNavigate("courses-dashboard")
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => onNavigate("courses-dashboard")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            {courseId ? "Edit Course" : "New Course"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {courseId ? "Update course details, lessons, and quizzes" : "Create a new course for your learners"}
          </p>
        </div>
        <Button onClick={saveCourse} className="bg-primary text-primary-foreground">
          <Save className="mr-2 h-4 w-4" /> Save
        </Button>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="lessons">Lessons ({lessons.length})</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes ({quizzes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardContent className="flex flex-col gap-6 p-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Course Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Introduction to Machine Learning" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="desc">Description</Label>
                <textarea
                  id="desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What will learners gain from this course?"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Visibility</Label>
                  <Select value={visibility} onValueChange={(v) => setVisibility(v as typeof visibility)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="invite-only">Invite Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lessons">
          <div className="flex flex-col gap-4">
            {lessons.map((lesson, idx) => (
              <Card key={lesson.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2 pt-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {idx + 1}
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col gap-3">
                      <Input
                        value={lesson.title}
                        onChange={(e) => updateLesson(lesson.id, { title: e.target.value })}
                        placeholder="Lesson title"
                      />
                      <Input
                        value={lesson.description}
                        onChange={(e) => updateLesson(lesson.id, { description: e.target.value })}
                        placeholder="Brief description"
                      />
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs">Type</Label>
                          <Select
                            value={lesson.type}
                            onValueChange={(v) => updateLesson(lesson.id, { type: v as Lesson["type"] })}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="video"><span className="flex items-center gap-1.5"><Video className="h-3 w-3" /> Video</span></SelectItem>
                              <SelectItem value="document"><span className="flex items-center gap-1.5"><FileText className="h-3 w-3" /> Document</span></SelectItem>
                              <SelectItem value="image"><span className="flex items-center gap-1.5"><ImageIcon className="h-3 w-3" /> Image</span></SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-xs">Duration (min)</Label>
                          <Input
                            type="number"
                            value={lesson.duration}
                            onChange={(e) => updateLesson(lesson.id, { duration: Number(e.target.value) })}
                            className="w-20"
                          />
                        </div>
                        <Input
                          value={lesson.contentUrl}
                          onChange={(e) => updateLesson(lesson.id, { contentUrl: e.target.value })}
                          placeholder="Content URL"
                          className="flex-1 min-w-[200px]"
                        />
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeLesson(lesson.id)} className="text-destructive shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" onClick={addLesson} className="border-dashed bg-transparent">
              <Plus className="mr-2 h-4 w-4" /> Add Lesson
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="quizzes">
          <div className="flex flex-col gap-6">
            {quizzes.map((quiz) => (
              <Card key={quiz.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex flex-col gap-2">
                      <Input
                        value={quiz.title}
                        onChange={(e) => updateQuiz(quiz.id, { title: e.target.value })}
                        placeholder="Quiz title"
                        className="font-semibold"
                      />
                      <Input
                        value={quiz.description}
                        onChange={(e) => updateQuiz(quiz.id, { description: e.target.value })}
                        placeholder="Quiz description"
                        className="text-sm"
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeQuiz(quiz.id)} className="text-destructive shrink-0 ml-2">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Max Attempts</Label>
                      <Input
                        type="number"
                        value={quiz.maxAttempts}
                        onChange={(e) => updateQuiz(quiz.id, { maxAttempts: Number(e.target.value) })}
                        className="w-20"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Passing Score (%)</Label>
                      <Input
                        type="number"
                        value={quiz.passingScore}
                        onChange={(e) => updateQuiz(quiz.id, { passingScore: Number(e.target.value) })}
                        className="w-20"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 pt-0">
                  {quiz.questions.map((q, qIdx) => (
                    <div key={q.id} className="rounded-lg border border-border bg-secondary/30 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Question {qIdx + 1}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeQuestion(quiz.id, q.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <Input
                        value={q.text}
                        onChange={(e) => updateQuestion(quiz.id, q.id, { text: e.target.value })}
                        placeholder="Enter question text"
                        className="mb-3"
                      />
                      <div className="flex flex-col gap-2">
                        {q.options.map((opt) => (
                          <div key={opt.id} className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateQuestion(quiz.id, q.id, { correctOptionId: opt.id })}
                              className="shrink-0"
                              aria-label={`Mark option ${opt.text || "empty"} as correct`}
                            >
                              {q.correctOptionId === opt.id ? (
                                <CheckCircle className="h-4 w-4 text-[hsl(var(--accent))]" />
                              ) : (
                                <Circle className="h-4 w-4 text-muted-foreground" />
                              )}
                            </button>
                            <Input
                              value={opt.text}
                              onChange={(e) => {
                                const updatedOpts = q.options.map((o) =>
                                  o.id === opt.id ? { ...o, text: e.target.value } : o
                                )
                                updateQuestion(quiz.id, q.id, { options: updatedOpts })
                              }}
                              placeholder="Option text"
                              className="flex-1"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => addQuestion(quiz.id)} className="border-dashed">
                    <Plus className="mr-2 h-3.5 w-3.5" /> Add Question
                  </Button>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" onClick={addQuiz} className="border-dashed bg-transparent">
              <Plus className="mr-2 h-4 w-4" /> Add Quiz
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
