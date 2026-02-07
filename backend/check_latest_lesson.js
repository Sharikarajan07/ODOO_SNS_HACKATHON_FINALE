const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const lesson = await prisma.lesson.findFirst({
        orderBy: { id: 'desc' }
    })
    console.log(JSON.stringify(lesson, null, 2))
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
