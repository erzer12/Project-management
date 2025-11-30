const { PrismaClient, Role, ProjectStatus, TaskStatus, Priority } = require('@prisma/client')
const { hash } = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const password = await hash('password123', 12)

    // Create Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
            password,
            role: Role.ADMIN,
        },
    })

    // Create Manager
    const manager = await prisma.user.upsert({
        where: { email: 'manager@example.com' },
        update: {},
        create: {
            email: 'manager@example.com',
            name: 'Manager User',
            password,
            role: Role.MANAGER,
        },
    })

    // Create Member
    const member = await prisma.user.upsert({
        where: { email: 'member@example.com' },
        update: {},
        create: {
            email: 'member@example.com',
            name: 'Member User',
            password,
            role: Role.MEMBER,
        },
    })

    // Create Project
    const project = await prisma.project.upsert({
        where: { id: 'project-1' },
        update: {},
        create: {
            id: 'project-1',
            title: 'Website Redesign',
            description: 'Redesigning the corporate website.',
            status: ProjectStatus.ACTIVE,
            managerId: manager.id,
            members: {
                connect: [{ id: member.id }],
            },
            tasks: {
                create: [
                    {
                        title: 'Design Homepage',
                        status: TaskStatus.IN_PROGRESS,
                        priority: Priority.HIGH,
                        assigneeId: member.id,
                    },
                    {
                        title: 'Setup CI/CD',
                        status: TaskStatus.TODO,
                        priority: Priority.MEDIUM,
                    },
                ],
            },
        },
    })

    console.log({ admin, manager, member, project })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
