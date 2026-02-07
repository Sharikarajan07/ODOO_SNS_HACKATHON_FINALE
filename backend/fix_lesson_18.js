const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const updatedLesson = await prisma.lesson.update({
        where: { id: 18 },
        data: {
            contentUrl: 'https://www.youtube.com/watch?v=1mHjMNZZvFo' // Same verified video
        }
    })
    console.log('Fixed lesson 18 video:', updatedLesson)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
