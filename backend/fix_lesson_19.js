const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const updatedLesson = await prisma.lesson.update({
        where: { id: 19 },
        data: {
            contentUrl: 'https://www.youtube.com/watch?v=okFb8n3G_q8' // Cleaned URL
        }
    })
    console.log('Fixed lesson 19 video:', updatedLesson)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
