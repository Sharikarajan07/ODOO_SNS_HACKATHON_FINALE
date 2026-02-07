export type UserRole = "admin" | "instructor" | "learner" | "guest"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  points: number
  badges: Badge[]
  createdAt: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earnedAt: string
}

export interface Course {
  id: string
  title: string
  description: string
  thumbnail: string
  instructorId: string
  instructorName: string
  status: "draft" | "published" | "archived"
  visibility: "public" | "private" | "invite-only"
  category: string
  lessons: Lesson[]
  quizzes: Quiz[]
  enrollments: Enrollment[]
  reviews: Review[]
  averageRating: number
  createdAt: string
  updatedAt: string
}

export interface Lesson {
  id: string
  courseId: string
  title: string
  description: string
  type: "video" | "document" | "image"
  contentUrl: string
  duration: number // minutes
  order: number
  attachments: Attachment[]
}

export interface Attachment {
  id: string
  name: string
  url: string
  type: string
}

export interface Quiz {
  id: string
  courseId: string
  title: string
  description: string
  questions: QuizQuestion[]
  maxAttempts: number
  passingScore: number
}

export interface QuizQuestion {
  id: string
  quizId: string
  text: string
  options: QuizOption[]
  correctOptionId: string
  order: number
}

export interface QuizOption {
  id: string
  text: string
}

export interface QuizAttempt {
  id: string
  quizId: string
  userId: string
  courseId: string
  answers: Record<string, string> // questionId -> selectedOptionId
  score: number
  totalQuestions: number
  completedAt: string
}

export interface Enrollment {
  id: string
  userId: string
  courseId: string
  status: "active" | "completed" | "dropped"
  progress: number // 0-100
  completedLessons: string[] // lesson IDs
  enrolledAt: string
  completedAt?: string
}

export interface LessonProgress {
  lessonId: string
  completed: boolean
  timeSpent: number // minutes
}

export interface Review {
  id: string
  userId: string
  userName: string
  courseId: string
  rating: number
  comment: string
  createdAt: string
}
