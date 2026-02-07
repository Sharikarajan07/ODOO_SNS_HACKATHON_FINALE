const express = require('express');
const prisma = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get dashboard stats (Admin/Instructor only)
router.get('/dashboard', authenticate, authorize('ADMIN', 'INSTRUCTOR'), async (req, res) => {
  try {
    const totalCourses = await prisma.course.count();
    const totalLearners = await prisma.user.count({ where: { role: 'LEARNER' } });
    const totalEnrollments = await prisma.enrollment.count();
    const activeEnrollments = await prisma.enrollment.count({
      where: { status: 'ACTIVE' }
    });

    const recentEnrollments = await prisma.enrollment.findMany({
      take: 5,
      orderBy: { enrolledAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        course: {
          select: { id: true, title: true }
        }
      }
    });

    res.json({
      totalCourses,
      totalLearners,
      totalEnrollments,
      activeEnrollments,
      recentEnrollments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get course analytics (Admin/Instructor only)
router.get('/course/:courseId', authenticate, authorize('ADMIN', 'INSTRUCTOR'), async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        _count: {
          select: { lessons: true, enrollments: true, reviews: true }
        }
      }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Categorize by status
    const yetToStart = enrollments.filter(e => e.progressPercentage === 0);
    const inProgress = enrollments.filter(e => e.progressPercentage > 0 && e.progressPercentage < 100);
    const completed = enrollments.filter(e => e.progressPercentage === 100);

    const reviews = await prisma.review.findMany({
      where: { courseId },
      select: { rating: true }
    });

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({
      course: {
        id: course.id,
        title: course.title,
        lessonCount: course._count.lessons,
        enrollmentCount: course._count.enrollments,
        reviewCount: course._count.reviews,
        averageRating: avgRating
      },
      learnerStats: {
        yetToStart: yetToStart.map(e => ({
          id: e.user.id,
          name: e.user.name,
          email: e.user.email,
          enrolledAt: e.enrolledAt,
          status: 'Yet to Start'
        })),
        inProgress: inProgress.map(e => ({
          id: e.user.id,
          name: e.user.name,
          email: e.user.email,
          enrolledAt: e.enrolledAt,
          progress: e.progressPercentage,
          status: 'In Progress'
        })),
        completed: completed.map(e => ({
          id: e.user.id,
          name: e.user.name,
          email: e.user.email,
          enrolledAt: e.enrolledAt,
          completedAt: e.completedAt,
          status: 'Completed'
        }))
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch course analytics' });
  }
});

// Get learner dashboard stats
router.get('/learner/dashboard', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const enrollments = await prisma.enrollment.count({
      where: { userId }
    });

    const completed = await prisma.enrollment.count({
      where: { userId, status: 'COMPLETED' }
    });

    const inProgress = await prisma.enrollment.count({
      where: { userId, status: 'ACTIVE', progressPercentage: { gt: 0 } }
    });

    const points = await prisma.points.findUnique({
      where: { userId }
    });

    const recentActivity = await prisma.progress.findMany({
      where: { userId },
      take: 5,
      orderBy: { lastViewed: 'desc' },
      include: {
        lesson: {
          include: {
            course: {
              select: { id: true, title: true }
            }
          }
        }
      }
    });

    res.json({
      totalEnrollments: enrollments,
      completedCourses: completed,
      inProgressCourses: inProgress,
      totalPoints: points?.totalPoints || 0,
      badge: points?.badge || 'Beginner',
      recentActivity
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch learner dashboard' });
  }
});

module.exports = router;
