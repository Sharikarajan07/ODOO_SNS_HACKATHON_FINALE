const express = require('express');
const prisma = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all enrollments (Admin only)
router.get('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    });

    res.json(enrollments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
});

// Enroll in a course
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ error: 'Course ID is required' });
    }

    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: parseInt(courseId)
        }
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId: parseInt(courseId)
      },
      include: {
        course: {
          include: {
            lessons: true
          }
        }
      }
    });

    res.status(201).json(enrollment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to enroll in course' });
  }
});

// Get user's enrollments
router.get('/my', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`[/enrollments/my] User ID: ${userId}`);

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            _count: {
              select: { lessons: true }
            },
            reviews: {
              select: { rating: true }
            }
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    });

    console.log(`[/enrollments/my] Found ${enrollments.length} enrollments`);
    enrollments.forEach(e => {
      console.log(`  - Course: ${e.course.title}, Progress: ${e.progressPercentage}%, Status: ${e.status}`);
    });

    // Add average rating to each course
    const enrichedEnrollments = enrollments.map(enrollment => {
      const avgRating = enrollment.course.reviews.length > 0
        ? enrollment.course.reviews.reduce((sum, r) => sum + r.rating, 0) / enrollment.course.reviews.length
        : 0;
      
      return {
        ...enrollment,
        course: {
          ...enrollment.course,
          averageRating: avgRating,
          lessonCount: enrollment.course._count.lessons
        }
      };
    });

    res.json(enrichedEnrollments);
  } catch (error) {
    console.error('[/enrollments/my] Error:', error);
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
});

// Get enrollments by user ID (Admin only)
router.get('/user/:userId', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            image: true
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    });

    res.json(enrollments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
});

// Get enrollment details
router.get('/:courseId', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = parseInt(req.params.courseId);

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      },
      include: {
        course: {
          include: {
            lessons: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    // Get progress for each lesson
    const progress = await prisma.progress.findMany({
      where: {
        userId,
        lessonId: { in: enrollment.course.lessons.map(l => l.id) }
      }
    });

    const lessonsWithProgress = enrollment.course.lessons.map(lesson => ({
      ...lesson,
      completed: progress.find(p => p.lessonId === lesson.id)?.completed || false
    }));

    res.json({
      ...enrollment,
      course: {
        ...enrollment.course,
        lessons: lessonsWithProgress
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch enrollment' });
  }
});

// Drop course
router.delete('/:courseId', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = parseInt(req.params.courseId);

    await prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      },
      data: {
        status: 'DROPPED'
      }
    });

    res.json({ message: 'Course dropped successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to drop course' });
  }
});

module.exports = router;
