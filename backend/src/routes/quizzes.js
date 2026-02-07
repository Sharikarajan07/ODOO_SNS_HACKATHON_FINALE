const express = require('express');
const prisma = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get quiz for a course
router.get('/course/:courseId', authenticate, async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);

    const quiz = await prisma.quiz.findFirst({
      where: { courseId },
      include: {
        questions: {
          include: {
            options: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    res.json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// Create quiz (Admin/Instructor only)
router.post('/', authenticate, authorize('ADMIN', 'INSTRUCTOR'), async (req, res) => {
  try {
    const { courseId, title, questions } = req.body;

    if (!courseId) {
      return res.status(400).json({ error: 'Course ID is required' });
    }

    const quiz = await prisma.quiz.create({
      data: {
        courseId: parseInt(courseId),
        title: title || 'Course Quiz',
        questions: questions ? {
          create: questions.map((q, idx) => ({
            questionText: q.questionText,
            order: idx,
            options: {
              create: q.options.map(opt => ({
                optionText: opt.optionText,
                isCorrect: opt.isCorrect
              }))
            }
          }))
        } : undefined
      },
      include: {
        questions: {
          include: {
            options: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    res.status(201).json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

// Add question to quiz (Admin/Instructor only)
router.post('/:quizId/questions', authenticate, authorize('ADMIN', 'INSTRUCTOR'), async (req, res) => {
  try {
    const quizId = parseInt(req.params.quizId);
    const { questionText, options } = req.body;

    if (!questionText || !options || options.length < 2) {
      return res.status(400).json({ error: 'Question text and at least 2 options required' });
    }

    const question = await prisma.quizQuestion.create({
      data: {
        quizId,
        questionText,
        options: {
          create: options.map(opt => ({
            optionText: opt.optionText,
            isCorrect: opt.isCorrect || false
          }))
        }
      },
      include: {
        options: true
      }
    });

    res.status(201).json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add question' });
  }
});

// Submit quiz attempt
router.post('/:quizId/attempt', authenticate, async (req, res) => {
  try {
    const quizId = parseInt(req.params.quizId);
    const userId = req.user.id;
    const { answers } = req.body; // { questionId: selectedOptionId }

    // Get quiz with questions and correct answers
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            options: true
          }
        }
      }
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Calculate score
    let correctCount = 0;
    quiz.questions.forEach(question => {
      const correctOption = question.options.find(opt => opt.isCorrect);
      const userAnswer = answers[question.id];
      
      if (correctOption && userAnswer === correctOption.id) {
        correctCount++;
      }
    });

    const score = (correctCount / quiz.questions.length) * 100;

    // Get attempt number
    const previousAttempts = await prisma.quizAttempt.count({
      where: { userId, quizId }
    });

    // Save attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        attemptNo: previousAttempts + 1,
        score
      }
    });

    // Award points (only on first attempt or if score improves)
    if (req.user.role === 'LEARNER') {
      const pointsToAward = Math.floor(score / 10); // 10 points per 10% score
      
      const userPoints = await prisma.points.upsert({
        where: { userId },
        update: {
          totalPoints: { increment: pointsToAward }
        },
        create: {
          userId,
          totalPoints: pointsToAward
        }
      });

      // Update badge based on total points
      let badge = 'Beginner';
      if (userPoints.totalPoints >= 500) badge = 'Expert';
      else if (userPoints.totalPoints >= 200) badge = 'Advanced';
      else if (userPoints.totalPoints >= 50) badge = 'Intermediate';

      await prisma.points.update({
        where: { userId },
        data: { badge }
      });

      res.json({
        attempt,
        pointsAwarded: pointsToAward,
        totalPoints: userPoints.totalPoints + pointsToAward,
        badge
      });
    } else {
      res.json({ attempt });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit quiz attempt' });
  }
});

// Get user's quiz attempts
router.get('/:quizId/attempts', authenticate, async (req, res) => {
  try {
    const quizId = parseInt(req.params.quizId);
    const userId = req.user.id;

    const attempts = await prisma.quizAttempt.findMany({
      where: { userId, quizId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(attempts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch attempts' });
  }
});

module.exports = router;
