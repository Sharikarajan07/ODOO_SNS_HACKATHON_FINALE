const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const updatedLesson = await prisma.lesson.update({
        where: { id: 7 },
        data: {
            contentUrl: 'https://www.youtube.com/watch?v=1mHjMNZZvFo'
        }
    })
    console.log('Updated lesson to Linda Raynier video:', updatedLesson)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
