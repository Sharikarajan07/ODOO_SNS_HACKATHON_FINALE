const express = require('express');
const prisma = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const { updateCourseProgress } = require('../utils/progress');

const router = express.Router();

// Update lesson progress
router.post('/lesson/:lessonId', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const lessonId = parseInt(req.params.lessonId);
    const { completed, timeSpent } = req.body;

    const progress = await prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId
        }
      },
      update: {
        completed: completed !== undefined ? completed : undefined,
        timeSpent: timeSpent ? { increment: timeSpent } : undefined,
        lastViewed: new Date()
      },
      create: {
        userId,
        lessonId,
        completed: completed || false,
        timeSpent: timeSpent || 0
      }
    });

    // Update course progress percentage
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { courseId: true }
    });

    if (lesson) {
      await updateCourseProgress(userId, lesson.courseId);
    }

    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Get user's progress for a course
router.get('/course/:courseId', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = parseInt(req.params.courseId);

    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      orderBy: { order: 'asc' }
    });

    const progress = await prisma.progress.findMany({
      where: {
        userId,
        lessonId: { in: lessons.map(l => l.id) }
      }
    });

    const lessonsWithProgress = lessons.map(lesson => {
      const lessonProgress = progress.find(p => p.lessonId === lesson.id);
      return {
        ...lesson,
        completed: lessonProgress?.completed || false,
        timeSpent: lessonProgress?.timeSpent || 0,
        lastViewed: lessonProgress?.lastViewed
      };
    });

    res.json(lessonsWithProgress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Get all progress for a user (Admin only)
router.get('/user/:userId', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const progress = await prisma.progress.findMany({
      where: { userId },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            courseId: true,
            course: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      },
      orderBy: { lastViewed: 'desc' }
    });

    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

module.exports = router;
