# Quick Setup Guide for LearnSphere

Follow these steps to get the system running in 5-10 minutes.

## Step 1: Install Backend Dependencies
```powershell
cd backend
npm install
```

## Step 2: Configure Database
Edit `backend/.env` with your PostgreSQL credentials:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/learnsphere?schema=public"
JWT_SECRET="learnsphere-secret-key-2026"
PORT=5000
NODE_ENV=development
```

## Step 3: Setup Database
```powershell
# Still in backend directory
npm run prisma:generate
npm run prisma:migrate
```

This will:
- Generate Prisma Client
- Create all database tables
- Apply migrations

## Step 4: Install Frontend Dependencies
```powershell
# Open new terminal
cd frontend
npm install
```

## Step 5: Start Development Servers

### Option A: Use the startup script (Easiest)
```powershell
# From project root
.\start-dev.ps1
```

### Option B: Manual start
Terminal 1 (Backend):
```powershell
cd backend
npm run dev
```

Terminal 2 (Frontend):
```powershell
cd frontend
npm run dev
```

## Step 6: Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Step 7: Create First Admin Account
1. Go to http://localhost:3000/register
2. Fill in details:
   - Name: Your Name
   - Email: admin@test.com
   - Password: admin123
   - Role: **Admin**
3. Click "Create Account"

## Step 8: Create Your First Course
1. You'll be redirected to Admin Dashboard
2. Click "New Course" button
3. Fill in course details:
   - Title: "Introduction to React"
   - Description: "Learn React from scratch"
   - Tags: "react, javascript"
   - Visibility: Public
   - Access Rule: Free
4. Click "Create Course"
5. You'll be taken to the course editor

## Step 9: Add Lessons
1. Click "Lessons" tab
2. Fill in lesson details:
   - Title: "What is React?"
   - Type: Video
   - Content URL: https://www.youtube.com/embed/SqcY0GlETPk
   - Description: "Introduction to React"
3. Click "Add Lesson"
4. Add 2-3 more lessons

## Step 10: Create Quiz
1. Click "Quiz" tab
2. Click "Create Quiz"
3. Add questions:
   - Question: "What is React?"
   - Options: 
     - [ ] A database
     - [x] A JavaScript library (check this as correct)
     - [ ] A CSS framework
     - [ ] A backend framework
4. Click "Add Question"
5. Add 2-3 more questions

## Step 11: Publish Course
1. Go back to "Course Details" tab
2. Click "Save Changes"
3. Go back to Dashboard
4. Find your course and click "Publish" button

## Step 12: Test Learner Flow
1. Logout (top right)
2. Click "Register" 
3. Create learner account:
   - Name: Test Learner
   - Email: learner@test.com
   - Password: learner123
   - Role: **Learner**
4. You'll see the Learner Dashboard
5. Click "Explore Courses" tab
6. Find your course and click "Enroll Now"
7. Click on the course card to view details
8. Start a lesson
9. Mark it complete
10. Take the quiz
11. See your points and badge!

## Troubleshooting

### PostgreSQL Not Running
```powershell
# Check if PostgreSQL service is running
# Windows: Services → PostgreSQL should be "Running"
```

### Port Already in Use
```powershell
# Backend (change in backend/.env)
PORT=5001

# Frontend (change in frontend/vite.config.js)
server: { port: 3001 }
```

### Database Connection Error
```powershell
# Test connection
psql -U postgres
# If this fails, PostgreSQL is not running or password is wrong

# Recreate database
DROP DATABASE learnsphere;
CREATE DATABASE learnsphere;
```

### Prisma Issues
```powershell
cd backend
rm -rf node_modules
npm install
npx prisma generate
npx prisma migrate reset --force
```

## You're All Set! 🎉

The system is now running and ready for demonstration.

## Quick Demo Script (3 minutes)

**Minute 1: Admin creates content**
- Show dashboard
- Create course quickly
- Add 1-2 lessons
- Add 1-2 quiz questions
- Publish

**Minute 2: Learner experience**
- Switch to learner account
- Enroll in course
- Complete a lesson
- Take quiz
- Show points earned

**Minute 3: Analytics**
- Switch back to admin
- Show reporting dashboard
- Show learner progress tracking
- Show course analytics

---

Last updated: February 2026
