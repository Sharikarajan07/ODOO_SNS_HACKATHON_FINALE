const express = require('express');
const prisma = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get lessons for a course
router.get('/course/:courseId', authenticate, async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);

    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      include: {
        attachments: true
      },
      orderBy: { order: 'asc' }
    });

    res.json(lessons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

// Get single lesson
router.get('/:id', async (req, res) => {
  // Mock req.user for logging if needed, or just remove the reliance on it
  const userId = req.user ? req.user.id : 'Anonymous';
  console.log(`[DEBUG] Fetching lesson ${req.params.id} for user ${userId}`);
  try {
    const lessonId = parseInt(req.params.id);

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        attachments: true,
        course: {
          select: { id: true, title: true }
        }
      }
    });

    console.log(`[DEBUG] Database query complete. Found lesson: ${lesson ? 'Yes' : 'No'}`);

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.json(lesson);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

// Create lesson (Admin/Instructor only)
router.post('/', authenticate, authorize('ADMIN', 'INSTRUCTOR'), async (req, res) => {
  try {
    const { courseId, title, type, contentUrl, description, order, attachments, responsibleId, duration, allowDownload } = req.body;

    if (!courseId || !title || !type || !contentUrl) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const lesson = await prisma.lesson.create({
      data: {
        courseId: parseInt(courseId),
        title,
        type,
        contentUrl,
        description,
        order: order || 0,
        duration: duration || 0,
        allowDownload: allowDownload !== undefined ? allowDownload : true,
        responsibleId: responsibleId ? parseInt(responsibleId) : req.user.id,
        attachments: attachments ? {
          create: attachments.map(att => ({
            type: att.type,
            url: att.url
          }))
        } : undefined
      },
      include: {
        attachments: true
      }
    });

    res.status(201).json(lesson);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create lesson' });
  }
});

// Update lesson (Admin/Instructor only)
router.put('/:id', authenticate, authorize('ADMIN', 'INSTRUCTOR'), async (req, res) => {
  try {
    const lessonId = parseInt(req.params.id);
    const { title, type, contentUrl, description, order, duration, allowDownload, responsibleId, attachments } = req.body;

    // Transaction to update lesson and replace attachments
    const lesson = await prisma.$transaction(async (prisma) => {
      // 1. Update basic fields
      const updatedLesson = await prisma.lesson.update({
        where: { id: lessonId },
        data: {
          title,
          type,
          contentUrl,
          description,
          order,
          duration,
          allowDownload,
          responsibleId: responsibleId ? parseInt(responsibleId) : undefined
        }
      });

      // 2. Handle attachments if provided
      if (attachments) {
        // Delete existing
        await prisma.lessonAttachment.deleteMany({
          where: { lessonId }
        });

        // Create new
        if (attachments.length > 0) {
          await prisma.lessonAttachment.createMany({
            data: attachments.map(att => ({
              lessonId,
              type: att.type,
              url: att.url
            }))
          });
        }
      }

      return prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { attachments: true }
      });
    });

    res.json(lesson);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update lesson' });
  }
});

// Delete lesson (Admin/Instructor only)
router.delete('/:id', authenticate, authorize('ADMIN', 'INSTRUCTOR'), async (req, res) => {
  try {
    const lessonId = parseInt(req.params.id);

    await prisma.lesson.delete({
      where: { id: lessonId }
    });

    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
});

// Add attachment to lesson (Admin/Instructor only)
router.post('/:id/attachments', authenticate, authorize('ADMIN', 'INSTRUCTOR'), async (req, res) => {
  try {
    const lessonId = parseInt(req.params.id);
    const { type, url } = req.body;

    const attachment = await prisma.lessonAttachment.create({
      data: {
        lessonId,
        type,
        url
      }
    });

    res.status(201).json(attachment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add attachment' });
  }
});

module.exports = router;
