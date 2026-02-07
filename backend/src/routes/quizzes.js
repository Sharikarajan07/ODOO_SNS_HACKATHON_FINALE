const express = require('express');
const prisma = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const { updateCourseProgress } = require('../utils/progress');

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

// Get single quiz by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const quizId = parseInt(req.params.id);

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            options: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// Update quiz details (Admin/Instructor only)
router.put('/:id', authenticate, authorize('ADMIN', 'INSTRUCTOR'), async (req, res) => {
  try {
    const quizId = parseInt(req.params.id);
    const { title, rewards } = req.body;

    const quiz = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        title,
        rewards
      }
    });

    res.json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update quiz' });
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

    const score = quiz.questions.length > 0
      ? (correctCount / quiz.questions.length) * 100
      : 0;

    // Get attempt number
    const previousAttempts = await prisma.quizAttempt.count({
      where: { userId, quizId }
    });
    const attemptNo = previousAttempts + 1;

    // Save attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        attemptNo,
        score
      }
    });

    // Update course progress (new logic to include quizzes in progress)
    await updateCourseProgress(userId, quiz.courseId);

    // Award points based on attempt number (only for learners)
    if (req.user.role === 'LEARNER') {
      // Get rewards config from quiz
      const rewards = quiz.rewards || { attempt1: 10, attempt2: 7, attempt3: 5, attempt4: 3 };

      // Determine base points based on attempt number
      let basePoints;
      if (attemptNo === 1) basePoints = rewards.attempt1 || 10;
      else if (attemptNo === 2) basePoints = rewards.attempt2 || 7;
      else if (attemptNo === 3) basePoints = rewards.attempt3 || 5;
      else basePoints = rewards.attempt4 || 3;

      // Calculate points based on score percentage
      const pointsToAward = Math.floor(basePoints * (score / 100));

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
      const totalPoints = userPoints.totalPoints; // userPoints already includes the increment
      let badge = userPoints.badge || 'Newbie'; // Default or keep existing

      if (totalPoints >= 120) badge = 'Master';
      else if (totalPoints >= 100) badge = 'Expert';
      else if (totalPoints >= 80) badge = 'Specialist';
      else if (totalPoints >= 60) badge = 'Achiever';
      else if (totalPoints >= 40) badge = 'Explorer';
      else if (totalPoints >= 20) badge = 'Newbie';

      // Only update if badge changed
      if (badge !== userPoints.badge) {
        await prisma.points.update({
          where: { userId },
          data: { badge }
        });
      }

      res.json({
        attempt,
        correctCount,
        totalQuestions: quiz.questions.length,
        pointsAwarded: pointsToAward,
        totalPoints,
        badge,
        attemptNo
      });
    } else {
      res.json({ attempt, correctCount, totalQuestions: quiz.questions.length });
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
