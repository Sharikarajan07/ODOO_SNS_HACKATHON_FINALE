const express = require('express');
const prisma = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all courses (with role-based filtering)
router.get('/', authenticate, async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    
    let where = {};
    
    // Learners and guests see only published courses
    if (role === 'LEARNER' || role === 'GUEST') {
      where = {
        published: true,
        visibility: { in: ['PUBLIC', 'RESTRICTED'] }
      };
    }
    // Admin and Instructor see all courses
    
    const courses = await prisma.course.findMany({
      where,
      include: {
        _count: {
          select: {
            lessons: true,
            enrollments: true,
            reviews: true
          }
        },
        reviews: {
          select: { rating: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate average rating
    const coursesWithRating = courses.map(course => {
      const avgRating = course.reviews.length > 0
        ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length
        : 0;
      return {
        ...course,
        averageRating: avgRating,
        lessonCount: course._count.lessons,
        enrollmentCount: course._count.enrollments,
        reviewCount: course._count.reviews
      };
    });

    res.json(coursesWithRating);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get single course
router.get('/:id', authenticate, async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          include: {
            attachments: true
          }
        },
        quizzes: {
          include: {
            questions: {
              include: {
                options: true
              },
              orderBy: { order: 'asc' }
            }
          }
        },
        reviews: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        },
        _count: {
          select: { enrollments: true }
        }
      }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check access
    if (course.published === false && 
        req.user.role !== 'ADMIN' && 
        req.user.role !== 'INSTRUCTOR') {
      return res.status(403).json({ error: 'Course not published' });
    }

    // Calculate average rating
    const avgRating = course.reviews.length > 0
      ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length
      : 0;

    res.json({
      ...course,
      averageRating: avgRating,
      enrollmentCount: course._count.enrollments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// Create course (Admin/Instructor only)
router.post('/', authenticate, authorize('ADMIN', 'INSTRUCTOR'), async (req, res) => {
  try {
    const { title, description, tags, image, visibility, accessRule } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        tags: tags || [],
        image,
        visibility: visibility || 'PUBLIC',
        accessRule: accessRule || 'FREE'
      }
    });

    res.status(201).json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Update course (Admin/Instructor only)
router.put('/:id', authenticate, authorize('ADMIN', 'INSTRUCTOR'), async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const { title, description, tags, image, visibility, accessRule, published } = req.body;

    const course = await prisma.course.update({
      where: { id: courseId },
      data: {
        title,
        description,
        tags,
        image,
        visibility,
        accessRule,
        published
      }
    });

    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// Publish/Unpublish course
router.patch('/:id/publish', authenticate, authorize('ADMIN', 'INSTRUCTOR'), async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const { published } = req.body;

    const course = await prisma.course.update({
      where: { id: courseId },
      data: { published }
    });

    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update course status' });
  }
});

// Delete course (Admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);

    await prisma.course.delete({
      where: { id: courseId }
    });

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

module.exports = router;
