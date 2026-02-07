# LearnSphere - eLearning Platform MVP

A full-stack eLearning platform with role-based access for Admins, Instructors, and Learners. Built for production-quality demonstration at national-level hackathon.

## 🚀 Tech Stack

**Frontend:**
- React 18
- Vite
- React Router
- Tailwind CSS
- Axios

**Backend:**
- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT Authentication
- bcryptjs

## 📋 Features

### Admin/Instructor Features
- ✅ Course creation and management
- ✅ Lesson management (Video, Document, Image)
- ✅ Quiz builder with multiple questions
- ✅ Course publishing/unpublishing
- ✅ Analytics & reporting dashboard
- ✅ Learner progress tracking

### Learner Features
- ✅ Course browsing and enrollment
- ✅ Full-screen lesson player
- ✅ Progress tracking
- ✅ Quiz taking with multiple attempts
- ✅ Points and badge gamification
- ✅ Course reviews and ratings

### Core Functionality
- ✅ JWT-based authentication
- ✅ Role-based authorization
- ✅ Course visibility controls
- ✅ Progress percentage calculation
- ✅ Gamification system
- ✅ Reporting and analytics

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 16+ installed
- PostgreSQL installed and running
- npm or yarn package manager

### 1. Database Setup

```bash
# Install PostgreSQL (if not installed)
# Windows: Download from https://www.postgresql.org/download/windows/
# Or use existing PostgreSQL instance

# Create database
psql -U postgres
CREATE DATABASE learnsphere;
\q
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Update .env file with your database credentials
# DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/learnsphere?schema=public"

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start backend server
npm run dev
```

Backend will run on http://localhost:5000

### 3. Frontend Setup

```bash
# Open new terminal
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start frontend development server
npm run dev
```

Frontend will run on http://localhost:3000

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

## 📁 Project Structure

```
ODOO_SNS_HACKATHON_FINALE/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js        # Prisma client
│   │   ├── middleware/
│   │   │   └── auth.js            # JWT authentication
│   │   ├── routes/
│   │   │   ├── auth.js            # Authentication routes
│   │   │   ├── courses.js         # Course management
│   │   │   ├── lessons.js         # Lesson management
│   │   │   ├── quizzes.js         # Quiz & attempts
│   │   │   ├── enrollments.js     # Course enrollments
│   │   │   ├── progress.js        # Progress tracking
│   │   │   ├── reviews.js         # Reviews & ratings
│   │   │   └── reporting.js       # Analytics
│   │   └── server.js              # Express server
│   ├── .env                       # Environment variables
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx         # Main layout wrapper
    │   │   └── ui.jsx             # Reusable UI components
    │   ├── context/
    │   │   └── AuthContext.jsx    # Auth state management
    │   ├── pages/
    │   │   ├── Login.jsx          # Login page
    │   │   ├── Register.jsx       # Registration page
    │   │   ├── AdminDashboard.jsx # Admin course management
    │   │   ├── CourseEditor.jsx   # Course creation/editing
    │   │   ├── ReportingDashboard.jsx # Analytics
    │   │   ├── LearnerDashboard.jsx   # Learner home
    │   │   ├── CourseDetail.jsx   # Course details & enrollment
    │   │   ├── LessonPlayer.jsx   # Full-screen lesson viewer
    │   │   └── QuizPage.jsx       # Quiz interface
    │   ├── services/
    │   │   └── api.js             # Axios API client
    │   ├── App.jsx                # Main app & routing
    │   └── main.jsx               # Entry point
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## 🔑 API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

### Courses
- GET `/api/courses` - Get all courses
- GET `/api/courses/:id` - Get course details
- POST `/api/courses` - Create course (Admin/Instructor)
- PUT `/api/courses/:id` - Update course
- PATCH `/api/courses/:id/publish` - Publish/unpublish
- DELETE `/api/courses/:id` - Delete course

### Lessons
- GET `/api/lessons/course/:courseId` - Get course lessons
- POST `/api/lessons` - Create lesson
- PUT `/api/lessons/:id` - Update lesson
- DELETE `/api/lessons/:id` - Delete lesson

### Quizzes
- GET `/api/quizzes/course/:courseId` - Get course quiz
- POST `/api/quizzes` - Create quiz
- POST `/api/quizzes/:quizId/questions` - Add question
- POST `/api/quizzes/:quizId/attempt` - Submit quiz attempt
- GET `/api/quizzes/:quizId/attempts` - Get user attempts

### Enrollments & Progress
- POST `/api/enrollments` - Enroll in course
- GET `/api/enrollments/my` - Get user enrollments
- POST `/api/progress/lesson/:lessonId` - Update lesson progress
- GET `/api/progress/course/:courseId` - Get course progress

### Reviews & Reporting
- POST `/api/reviews` - Add review
- GET `/api/reviews/course/:courseId` - Get course reviews
- GET `/api/reporting/dashboard` - Admin dashboard stats
- GET `/api/reporting/course/:courseId` - Course analytics
- GET `/api/reporting/learner/dashboard` - Learner stats

## 🎨 UI Highlights

- Clean, modern SaaS-style design
- Responsive layout (mobile-friendly)
- Role-based navigation
- Real-time progress tracking
- Toast notifications for actions
- Full-screen lesson player
- One-question-per-page quiz UI
- Kanban/List view toggle for courses

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Role-based route protection
- Input validation
- SQL injection prevention (Prisma)

## 📊 Database Schema

- **User** - User accounts with roles
- **Course** - Course information
- **Lesson** - Course lessons with order
- **LessonAttachment** - Additional resources
- **Quiz** - Course quizzes
- **QuizQuestion** - Quiz questions
- **QuizOption** - Answer options
- **QuizAttempt** - User attempts & scores
- **Enrollment** - User-course relationships
- **Progress** - Lesson completion tracking
- **Points** - Gamification points & badges
- **Review** - Course reviews & ratings

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
# Windows: Check Services -> PostgreSQL

# Test connection
psql -U postgres -d learnsphere
```

### Port Already in Use
```bash
# Backend (Port 5000)
# Change PORT in backend/.env

# Frontend (Port 3000)
# Change port in frontend/vite.config.js
```

### Prisma Issues
```bash
cd backend
npx prisma generate
npx prisma migrate reset --force
```

## 🚦 Quick Test Credentials

After initial setup, you can create test accounts:

**Admin:**
- Email: admin@test.com
- Password: admin123

**Instructor:**
- Email: instructor@test.com
- Password: instructor123

**Learner:**
- Email: learner@test.com
- Password: learner123

## 📝 Notes

- This is an MVP - suitable for demonstration purposes
- File uploads are via URL (not local upload)
- Payment system is mocked (FREE/PAID distinction)
- Time tracking is basic (10-second intervals)
- Points: 10 points per 10% quiz score
- Badges: Beginner (0-49), Intermediate (50-199), Advanced (200-499), Expert (500+)

## 🎓 About

Built for national-level hackathon demonstration. Clean, production-ready code following best practices with proper error handling and validation.

## 📄 License

MIT License - Free to use and modify.
