const { PrismaClient, Role, ProjectStatus, TaskStatus, Priority } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    // Hash for 'password123'
    const password = '$2a$10$v47f9RR8hzSOkbNM4fNE3VY.skejt5uW'

    // Create Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: { status: 'ACTIVE' },
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
            password,
            role: Role.ADMIN,
            status: 'ACTIVE'
        },
    })

    // Create Managers
    const manager1 = await prisma.user.upsert({
        where: { email: 'manager@example.com' },
        update: { status: 'ACTIVE' },
        create: {
            email: 'manager@example.com',
            name: 'Sarah Manager',
            password,
            role: Role.MANAGER,
            status: 'ACTIVE',
            jobTitle: 'Product Manager',
            bio: 'Experienced PM with a focus on agile methodologies.'
        },
    })

    const manager2 = await prisma.user.upsert({
        where: { email: 'manager2@example.com' },
        update: { status: 'ACTIVE' },
        create: {
            email: 'manager2@example.com',
            name: 'Mike Lead',
            password,
            role: Role.MANAGER,
            status: 'ACTIVE',
            jobTitle: 'Engineering Lead'
        },
    })

    // Create Members
    const members = []
    for (let i = 1; i <= 5; i++) {
        const member = await prisma.user.upsert({
            where: { email: `member${i}@example.com` },
            update: { status: 'ACTIVE' },
            create: {
                email: `member${i}@example.com`,
                name: `Member ${i}`,
                password,
                role: Role.MEMBER,
                status: 'ACTIVE',
                jobTitle: 'Developer'
            },
        })
        members.push(member)
    }

    // Create Projects
    const project1 = await prisma.project.create({
        data: {
            title: 'Website Redesign',
            description: 'Redesigning the corporate website with modern UI/UX.',
            status: ProjectStatus.ACTIVE,
            managerId: manager1.id,
            members: {
                connect: [members[0], members[1], members[2]].map(m => ({ id: m.id })),
            },
            columns: {
                create: [
                    { title: 'Backlog', order: 0 },
                    { title: 'To Do', order: 1 },
                    { title: 'In Progress', order: 2 },
                    { title: 'Review', order: 3 },
                    { title: 'Done', order: 4 },
                ]
            }
        },
    })

    const project2 = await prisma.project.create({
        data: {
            title: 'Mobile App Launch',
            description: 'Launching the new iOS and Android apps.',
            status: ProjectStatus.ACTIVE,
            managerId: manager2.id,
            members: {
                connect: [members[2], members[3], members[4]].map(m => ({ id: m.id })),
            },
            columns: {
                create: [
                    { title: 'Backlog', order: 0 },
                    { title: 'To Do', order: 1 },
                    { title: 'In Progress', order: 2 },
                    { title: 'Done', order: 3 },
                ]
            }
        },
    })

    // Create Tasks & Comments
    // Need to fetch column IDs first since we just created them
    const p1InProgress = await prisma.column.findFirst({ where: { projectId: project1.id, title: 'In Progress' } })
    const p1ToDo = await prisma.column.findFirst({ where: { projectId: project1.id, title: 'To Do' } })
    const p2Done = await prisma.column.findFirst({ where: { projectId: project2.id, title: 'Done' } })

    if (p1InProgress) {
        await prisma.task.create({
            data: {
                title: 'Design Homepage',
                description: 'Create high-fidelity mockups for the new homepage.',
                status: TaskStatus.IN_PROGRESS,
                priority: Priority.HIGH,
                projectId: project1.id,
                assigneeId: members[0].id,
                columnId: p1InProgress.id,
                comments: {
                    create: [
                        { content: 'Drafts look good!', authorId: manager1.id },
                        { content: 'Will update based on feedback.', authorId: members[0].id }
                    ]
                }
            }
        })
    }

    if (p1ToDo) {
        await prisma.task.create({
            data: {
                title: 'Setup CI/CD',
                status: TaskStatus.TODO,
                priority: Priority.MEDIUM,
                projectId: project1.id,
                columnId: p1ToDo.id,
            }
        })
    }

    if (p2Done) {
        await prisma.task.create({
            data: {
                title: 'API Integration',
                status: TaskStatus.DONE,
                priority: Priority.HIGH,
                projectId: project2.id,
                assigneeId: members[3].id,
                columnId: p2Done.id,
            }
        })
    }

    console.log('Seeding completed successfully.')
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
