const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDefUser() {
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { name: { contains: 'def', mode: 'insensitive' } },
          { email: { contains: 'def', mode: 'insensitive' } }
        ]
      },
      include: {
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        progress: {
          include: {
            lesson: {
              select: {
                id: true,
                title: true,
                courseId: true
              }
            }
          }
        }
      }
    });

    if (user) {
      console.log('\n=== User Info ===');
      console.log(`ID: ${user.id}`);
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      
      console.log('\n=== Enrollments (${user.enrollments.length}) ===');
      user.enrollments.forEach(e => {
        console.log(`Course: ${e.course.title} - Status: ${e.status} - Progress: ${e.progressPercentage}%`);
      });
      
      console.log(`\n=== Progress Records (${user.progress.length}) ===`);
      const completedCount = user.progress.filter(p => p.completed).length;
      console.log(`Completed: ${completedCount}/${user.progress.length}`);
      const totalTime = user.progress.reduce((sum, p) => sum + p.timeSpent, 0);
      console.log(`Total Time Spent: ${totalTime} minutes`);
    } else {
      console.log('User not found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDefUser();
