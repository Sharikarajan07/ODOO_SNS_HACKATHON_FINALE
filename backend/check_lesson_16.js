const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLesson() {
    try {
        const lesson = await prisma.lesson.findUnique({
            where: { id: 16 }
        });
        console.log('Lesson 16:', lesson);
    } catch (error) {
        console.error('Error fetching lesson:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkLesson();
