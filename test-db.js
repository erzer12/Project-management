const { PrismaClient } = require('@prisma/client')
console.log('PrismaClient:', PrismaClient)
const prisma = new PrismaClient()
console.log('prisma.user:', prisma.user)

async function main() {
    try {
        const count = await prisma.user.count()
        console.log('User count:', count)
    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
