const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkQuiz() {
    try {
        const quiz = await prisma.quiz.findUnique({
            where: { id: 4 },
            include: { questions: true }
        });
        console.log('Quiz 4:', quiz);

        // Also list all quizzes to see IDs
        const allQuizzes = await prisma.quiz.findMany({
            select: { id: true, courseId: true, title: true }
        });
        console.log('All Quizzes:', allQuizzes);

    } catch (error) {
        console.error('Error fetching quiz:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkQuiz();
