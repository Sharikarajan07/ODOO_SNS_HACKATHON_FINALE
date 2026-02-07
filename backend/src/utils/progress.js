const prisma = require('../config/database');

/**
 * Updates the progress percentage for a user in a specific course.
 * Counts both completed lessons and attempted quizzes.
 * @param {number} userId 
 * @param {number} courseId 
 */
async function updateCourseProgress(userId, courseId) {
    try {
        // 1. Get Total Items (Lessons + Quizzes)
        const totalLessons = await prisma.lesson.count({
            where: { courseId }
        });

        const totalQuizzes = await prisma.quiz.count({
            where: { courseId }
        });

        const totalItems = totalLessons + totalQuizzes;

        if (totalItems === 0) return 0;

        // 2. Get Completed Items
        const completedLessons = await prisma.progress.count({
            where: {
                userId,
                completed: true,
                lesson: {
                    courseId
                }
            }
        });

        // For quizzes, check if at least one attempt exists
        // We get all quizzes for the course first
        const courseQuizzes = await prisma.quiz.findMany({
            where: { courseId },
            select: { id: true }
        });

        const quizIds = courseQuizzes.map(q => q.id);

        // Count how many of these quizzes have at least one attempt by the user
        // Prisma doesn't support "count distinct" easily with relation filters in this generic way
        // so we'll query attempts for these quizzes
        const attempts = await prisma.quizAttempt.findMany({
            where: {
                userId,
                quizId: { in: quizIds }
            },
            distinct: ['quizId'], // Ensure we only count each quiz once
            select: { quizId: true }
        });

        const completedQuizzes = attempts.length;

        // 3. Calculate Percentage
        const progressPercentage = ((completedLessons + completedQuizzes) / totalItems) * 100;

        // 4. Update Enrollment
        await prisma.enrollment.update({
            where: {
                userId_courseId: {
                    userId,
                    courseId
                }
            },
            data: {
                progressPercentage,
                status: progressPercentage === 100 ? 'COMPLETED' : 'ACTIVE',
                completedAt: progressPercentage === 100 ? new Date() : null
            }
        });

        return progressPercentage;

    } catch (error) {
        console.error(`Failed to update course progress for user ${userId} course ${courseId}:`, error);
        // Don't throw, just log to prevent blocking the request
    }
}

module.exports = { updateCourseProgress };
