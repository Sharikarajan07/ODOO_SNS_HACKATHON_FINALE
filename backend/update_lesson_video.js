const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const updatedLesson = await prisma.lesson.update({
        where: { id: 7 },
        data: {
            contentUrl: 'https://www.youtube.com/watch?v=ToW8h2qY2i4'
        }
    })
    console.log('Updated lesson:', updatedLesson)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
