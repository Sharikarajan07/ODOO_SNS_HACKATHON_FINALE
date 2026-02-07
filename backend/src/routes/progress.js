const express = require('express');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth');

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
      const totalLessons = await prisma.lesson.count({
        where: { courseId: lesson.courseId }
      });

      const completedLessons = await prisma.progress.count({
        where: {
          userId,
          completed: true,
          lesson: {
            courseId: lesson.courseId
          }
        }
      });

      const progressPercentage = (completedLessons / totalLessons) * 100;

      await prisma.enrollment.update({
        where: {
          userId_courseId: {
            userId,
            courseId: lesson.courseId
          }
        },
        data: {
          progressPercentage,
          status: progressPercentage === 100 ? 'COMPLETED' : 'ACTIVE',
          completedAt: progressPercentage === 100 ? new Date() : null
        }
      });
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

module.exports = router;
