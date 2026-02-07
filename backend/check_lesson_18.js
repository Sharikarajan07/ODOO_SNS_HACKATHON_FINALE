const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const lesson = await prisma.lesson.findUnique({
        where: { id: 18 }
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
