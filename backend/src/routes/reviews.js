const express = require('express');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Add review for a course
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, rating, comment } = req.body;

    if (!courseId || !rating) {
      return res.status(400).json({ error: 'Course ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if user is enrolled
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: parseInt(courseId)
        }
      }
    });

    if (!enrollment) {
      return res.status(400).json({ error: 'Must be enrolled to review' });
    }

    const review = await prisma.review.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId: parseInt(courseId)
        }
      },
      update: {
        rating,
        comment
      },
      create: {
        userId,
        courseId: parseInt(courseId),
        rating,
        comment
      },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    });

    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add review' });
  }
});

// Get reviews for a course
router.get('/course/:courseId', async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);

    const reviews = await prisma.review.findMany({
      where: { courseId },
      include: {
        user: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

module.exports = router;
