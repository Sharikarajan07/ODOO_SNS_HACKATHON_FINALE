# LearnSphere - eLearning Platform

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-16+-000000?logo=next.js&logoColor=white)](https://nextjs.org/)

A full-stack eLearning platform with role-based access for **Admins**, **Instructors**, and **Learners**. Built for production-quality demonstration at national-level hackathon.

---

## 🚀 Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend (Next.js)** | Next.js 16, React 19, Tailwind CSS, Radix UI, shadcn/ui, React Hook Form, Zod |
| **Frontend (Vite)** | React 18, Vite 5, React Router, Axios, Tailwind CSS |
| **Backend** | Node.js, Express.js, Prisma ORM, PostgreSQL |
| **Authentication** | JWT, bcryptjs |
| **Validation** | express-validator, Zod |

---

## 📋 Features

### 👨‍💼 Admin/Instructor Features
| Feature | Status |
|---------|--------|
| Course creation and management | ✅ |
| Lesson management (Video, Document, Image) | ✅ |
| Quiz builder with multiple questions | ✅ |
| Course publishing/unpublishing | ✅ |
| Analytics & reporting dashboard | ✅ |
| Learner progress tracking | ✅ |

### 🎓 Learner Features
| Feature | Status |
|---------|--------|
| Course browsing and enrollment | ✅ |
| Full-screen lesson player | ✅ |
| Progress tracking | ✅ |
| Quiz taking with multiple attempts | ✅ |
| Points and badge gamification | ✅ |
| Course reviews and ratings | ✅ |

### 🔧 Core Functionality
| Feature | Status |
|---------|--------|
| JWT-based authentication | ✅ |
| Role-based authorization | ✅ |
| Course visibility controls | ✅ |
| Progress percentage calculation | ✅ |
| Gamification system | ✅ |
| Reporting and analytics | ✅ |

---

## 🛠️ Setup Instructions

### Prerequisites

- **Node.js** 16+ ([Download](https://nodejs.org/))
- **PostgreSQL** 15+ ([Download](https://www.postgresql.org/download/))
- **pnpm** (recommended) or npm

### 1. Clone the Repository

```bash
git clone https://github.com/Sharikarajan07/ODOO_SNS_HACKATHON_FINALE.git
cd ODOO_SNS_HACKATHON_FINALE
```

### 2. Database Setup

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE learnsphere;
\q
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
# Edit .env file with your database credentials:
# DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/learnsphere?schema=public"
# JWT_SECRET="learnsphere-secret-key-2026"
# PORT=5000

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start backend server
npm run dev
```

> Backend runs at: http://localhost:5000

### 4. Frontend Setup (Choose One)

#### Option A: Next.js Frontend (Root)

```bash
# From project root
pnpm install  # or npm install
pnpm dev      # or npm run dev
```

> Frontend runs at: http://localhost:3000

#### Option B: Vite Frontend

```bash
cd frontend

npm install
npm run dev
```

> Frontend runs at: http://localhost:3000

### 5. Quick Start Script (Windows)

```powershell
# From project root
.\start-dev.ps1
```

## 🎯 Demo Flow (3-minute demonstration)

### Step 1: Create Admin Account (30 seconds)
1. Go to http://localhost:3000/register
2. Register as Admin:
   - Name: Admin User
   - Email: admin@learnsphere.com
   - Password: admin123
   - Role: Admin

### Step 2: Create Course & Content (60 seconds)
1. Click "New Course"
2. Fill course details:
   - Title: "React Fundamentals"
   - Description: "Learn React from scratch"
   - Visibility: Public
3. Click "Save"
4. Add Lessons:
   - Lesson 1: Introduction (Video URL: https://www.youtube.com/embed/SqcY0GlETPk)
   - Lesson 2: Components
5. Create Quiz:
   - Add 2-3 questions with options
6. Publish course

### Step 3: Learner Experience (60 seconds)
1. Logout and register as Learner:
   - Email: learner@test.com
   - Role: Learner
2. Browse courses and enroll in "React Fundamentals"
3. Complete a lesson (marks as complete)
4. Take quiz and earn points
5. View badge earned

### Step 4: Check Analytics (30 seconds)
1. Logout and login as Admin
2. View dashboard statistics
3. Click on course analytics
4. Show learner progress tracking

---

## 📁 Project Structure

```
ODOO_SNS_HACKATHON_FINALE/
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home page
│   └── globals.css                # Global styles
├── components/                    # React components
│   ├── ui/                        # shadcn/ui components
│   ├── app-shell.tsx              # Main app shell
│   ├── course-detail.tsx          # Course details view
│   ├── course-editor.tsx          # Course creation/editing
│   ├── courses-dashboard.tsx      # Admin dashboard
│   ├── learner-courses.tsx        # Learner course view
│   ├── lesson-player.tsx          # Lesson viewer
│   ├── login-form.tsx             # Authentication
│   ├── quiz-ui.tsx                # Quiz interface
│   └── reporting-dashboard.tsx    # Analytics
├── lib/                           # Utilities and types
│   ├── auth-context.tsx           # Auth state management
│   ├── data.ts                    # Data helpers
│   ├── types.ts                   # TypeScript types
│   └── utils.ts                   # Utility functions
├── hooks/                         # Custom React hooks
├── backend/                       # Express.js API
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── config/                # Configuration
│   │   ├── middleware/            # Auth middleware
│   │   ├── routes/                # API routes
│   │   └── server.js              # Express server
│   └── package.json
├── frontend/                      # Vite React app (alternative)
│   ├── src/                       # React source
│   └── package.json
├── package.json                   # Next.js dependencies
├── tailwind.config.ts             # Tailwind configuration
└── start-dev.ps1                  # Dev startup script
```

---

## 🔑 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | Get all courses |
| GET | `/api/courses/:id` | Get course details |
| POST | `/api/courses` | Create course (Admin/Instructor) |
| PUT | `/api/courses/:id` | Update course |
| PATCH | `/api/courses/:id/publish` | Publish/unpublish |
| DELETE | `/api/courses/:id` | Delete course |

### Lessons
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/lessons/course/:courseId` | Get course lessons |
| POST | `/api/lessons` | Create lesson |
| PUT | `/api/lessons/:id` | Update lesson |
| DELETE | `/api/lessons/:id` | Delete lesson |

### Quizzes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quizzes/course/:courseId` | Get course quiz |
| POST | `/api/quizzes` | Create quiz |
| POST | `/api/quizzes/:quizId/questions` | Add question |
| POST | `/api/quizzes/:quizId/attempt` | Submit quiz attempt |
| GET | `/api/quizzes/:quizId/attempts` | Get user attempts |

### Enrollments & Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/enrollments` | Enroll in course |
| GET | `/api/enrollments/my` | Get user enrollments |
| POST | `/api/progress/lesson/:lessonId` | Update lesson progress |
| GET | `/api/progress/course/:courseId` | Get course progress |

### Reviews & Reporting
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reviews` | Add review |
| GET | `/api/reviews/course/:courseId` | Get course reviews |
| GET | `/api/reporting/dashboard` | Admin dashboard stats |
| GET | `/api/reporting/course/:courseId` | Course analytics |
| GET | `/api/reporting/learner/dashboard` | Learner stats |

---

## 🎨 UI Highlights

- Clean, modern SaaS-style design with shadcn/ui components
- Fully responsive layout (mobile-friendly)
- Role-based navigation and dashboards
- Real-time progress tracking
- Toast notifications for user actions
- Full-screen immersive lesson player
- One-question-per-page quiz interface
- Kanban/List view toggle for course management

---

## 🔒 Security Features

| Feature | Implementation |
|---------|----------------|
| Password Hashing | bcryptjs |
| Authentication | JWT tokens |
| Authorization | Role-based middleware |
| Input Validation | express-validator, Zod |
| SQL Injection Prevention | Prisma ORM |

---

## 📊 Database Schema

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│      User       │────<│   Enrollment    │>────│     Course      │
│                 │     └─────────────────┘     │                 │
│  - id           │                             │  - id           │
│  - name         │     ┌─────────────────┐     │  - title        │
│  - email        │────<│    Progress     │     │  - published    │
│  - password     │     └─────────────────┘     │  - visibility   │
│  - role         │                             │                 │
└─────────────────┘     ┌─────────────────┐     └─────────────────┘
        │               │     Lesson      │>────────────┘
        │               │                 │
        │               │  - type         │
        │               │  - contentUrl   │
        │               │  - order        │
        │               └─────────────────┘
        │
        │     ┌─────────────────┐     ┌─────────────────┐
        └────<│   QuizAttempt   │>────│      Quiz       │
              │                 │     │                 │
              │  - score        │     │  - questions    │
              │  - attempt #    │     │  - rewards      │
              └─────────────────┘     └─────────────────┘
```

**Models:** User, Course, Lesson, LessonAttachment, Quiz, QuizQuestion, QuizOption, QuizAttempt, Enrollment, Progress, Points, Review

---

## 🐛 Troubleshooting

<details>
<summary><b>Database Connection Issues</b></summary>

```bash
# Check PostgreSQL is running
# Windows: Check Services -> PostgreSQL

# Test connection
psql -U postgres -d learnsphere
```

</details>

<details>
<summary><b>Port Already in Use</b></summary>

```bash
# Backend (Port 5000) - Change PORT in backend/.env
# Frontend (Port 3000) - Change port in vite.config.js or next.config.mjs
```

</details>

<details>
<summary><b>Prisma Issues</b></summary>

```bash
cd backend
npx prisma generate
npx prisma migrate reset --force
```

</details>

---

## 🚦 Test Credentials

After initial setup, you can create test accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@test.com | admin123 |
| Instructor | instructor@test.com | instructor123 |
| Learner | learner@test.com | learner123 |

---

## 🎮 Gamification System

| Badge | Points Required |
|-------|----------------|
| 🌱 Beginner | 0 - 49 |
| ⭐ Intermediate | 50 - 199 |
| 🏆 Advanced | 200 - 499 |
| 👑 Expert | 500+ |

> **Points Earning:** 10 points per 10% quiz score

---

## 📝 Notes

- This is an MVP - suitable for demonstration purposes
- File uploads are via URL (not local upload)
- Payment system is mocked (FREE/PAID distinction)
- Time tracking is basic (10-second intervals)

---

## 🎓 About

Built for **Odoo SNS Hackathon** - national-level demonstration. Clean, production-ready code following best practices with proper error handling and validation.

### Contributors

- [@Sharikarajan07](https://github.com/Sharikarajan07)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) - free to use and modify.
