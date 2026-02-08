const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLessons() {
  try {
    const lessons = await prisma.lesson.findMany({
      take: 5,
      where: { type: 'VIDEO' },
      select: {
        id: true,
        title: true,
        contentUrl: true,
        type: true
      }
    });
    
    console.log('\n=== LESSON URLs IN DATABASE ===\n');
    lessons.forEach(lesson => {
      console.log(`ID: ${lesson.id}`);
      console.log(`Title: ${lesson.title}`);
      console.log(`URL: ${lesson.contentUrl}`);
      console.log(`Type: ${lesson.type}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLessons();
