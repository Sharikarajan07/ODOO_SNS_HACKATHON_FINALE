const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkEnrollments() {
  try {
    const enrollments = await prisma.enrollment.findMany({
      include: {
        course: true,
        user: true
      }
    })
    console.log('Total enrollments:', enrollments.length)
    console.log('Enrollments:', JSON.stringify(enrollments, null, 2))
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkEnrollments()
