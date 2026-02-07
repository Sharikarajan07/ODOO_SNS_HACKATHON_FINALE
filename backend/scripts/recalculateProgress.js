const { PrismaClient } = require('@prisma/client');
const { updateCourseProgress } = require('../src/utils/progress');

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Starting progress recalculation...');

    try {
        const enrollments = await prisma.enrollment.findMany();
        console.log(`Found ${enrollments.length} enrollments to update.`);

        for (const enrollment of enrollments) {
            const newProgress = await updateCourseProgress(enrollment.userId, enrollment.courseId);
            console.log(`Updated User ${enrollment.userId} Course ${enrollment.courseId}: ${newProgress.toFixed(1)}%`);
        }

        console.log('✅ Progress recalculation complete!');
    } catch (error) {
        console.error('❌ Failed to recalculate progress:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
