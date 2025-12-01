'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ProjectStatus, Role } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const CreateProjectSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    managerId: z.string().min(1, "Manager is required"),
    members: z.array(z.string()).optional(),
})

export async function getProjects() {
    const session = await auth()
    if (!session?.user) return []

    const { role, id } = session.user

    const include = {
        manager: true,
        members: true,
        _count: {
            select: { tasks: true }
        }
    }

    if (role === Role.ADMIN) {
        return await prisma.project.findMany({
            include,
            orderBy: { updatedAt: 'desc' }
        })
    }

    if (role === Role.MANAGER) {
        return await prisma.project.findMany({
            where: { managerId: id },
            include,
            orderBy: { updatedAt: 'desc' }
        })
    }

    // MEMBER
    return await prisma.project.findMany({
        where: { members: { some: { id } } },
        include,
        orderBy: { updatedAt: 'desc' }
    })
}

export async function getDashboardStats() {
    const session = await auth()
    if (!session?.user) return { totalProjects: 0, activeProjects: 0, totalTasks: 0, completedTasks: 0 }

    const { role, id } = session.user

    let projectWhere = {}
    if (role === Role.MANAGER) {
        projectWhere = { managerId: id }
    } else if (role === Role.MEMBER) {
        projectWhere = { members: { some: { id } } }
    }

    const totalProjects = await prisma.project.count({ where: projectWhere })
    const activeProjects = await prisma.project.count({ where: { ...projectWhere, status: ProjectStatus.ACTIVE } })

    // For tasks, we need to count tasks in projects visible to the user
    const totalTasks = await prisma.task.count({
        where: { project: projectWhere }
    })

    const completedTasks = await prisma.task.count({
        where: {
            project: projectWhere,
            status: 'DONE'
        }
    })

    return { totalProjects, activeProjects, totalTasks, completedTasks }
}

export async function createProject(formData: FormData) {
    const session = await auth()
    if (!session?.user || session.user.role !== Role.ADMIN) {
        return { error: "Unauthorized" }
    }

    const rawData = {
        title: formData.get('title'),
        description: formData.get('description'),
        managerId: formData.get('managerId'),
        members: formData.getAll('members'),
    }

    const validatedFields = CreateProjectSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return { error: "Invalid fields" }
    }

    const { title, description, managerId, members } = validatedFields.data

    try {
        // Create default columns
        const defaultColumns = [
            { title: 'Backlog', order: 0 },
            { title: 'To Do', order: 1 },
            { title: 'In Progress', order: 2 },
            { title: 'Review', order: 3 },
            { title: 'Done', order: 4 },
        ]

        await prisma.project.create({
            data: {
                title,
                description,
                managerId,
                status: ProjectStatus.ACTIVE,
                members: {
                    connect: members?.map((id) => ({ id })) || []
                },
                columns: {
                    create: defaultColumns
                }
            },
        })

        // Notify members
        if (members && members.length > 0) {
            const { createNotification } = await import("./notification-actions")
            await Promise.all(members.map(memberId =>
                createNotification(memberId, `You were added to project: ${title}`, 'INFO')
            ))
        }
    } catch (error) {
        return { error: "Failed to create project" }
    }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function updateProjectStatus(projectId: string, status: ProjectStatus) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { managerId: true }
    })

    if (!project) return { error: "Project not found" }

    if (session.user.role !== Role.ADMIN && project.managerId !== session.user.id) {
        return { error: "Unauthorized" }
    }

    try {
        await prisma.project.update({
            where: { id: projectId },
            data: { status }
        })
        revalidatePath(`/dashboard/projects/${projectId}`)
        return { success: true }
    } catch (error) {
        return { error: "Failed to update status" }
    }
}

export async function deleteProject(projectId: string) {
    const session = await auth()
    if (!session?.user || session.user.role !== Role.ADMIN) {
        return { error: "Unauthorized" }
    }

    try {
        await prisma.project.delete({
            where: { id: projectId },
        })
    } catch (error) {
        return { error: "Failed to delete project" }
    }

    revalidatePath('/dashboard')
    return { success: true }
}



export async function getManagers() {
    const session = await auth()
    if (!session?.user || session.user.role !== Role.ADMIN) return []

    return await prisma.user.findMany({
        where: { role: Role.MANAGER }
    })
}

export async function requestMember(projectId: string, memberId: string) {
    const session = await auth()
    if (!session?.user || session.user.role !== Role.MANAGER) return { error: "Unauthorized" }

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project || project.managerId !== session.user.id) return { error: "Unauthorized" }

    try {
        // Notify all admins
        const admins = await prisma.user.findMany({ where: { role: Role.ADMIN } })
        const { createNotification } = await import("./notification-actions")

        await Promise.all(admins.map(admin =>
            createNotification(admin.id, `Manager ${session.user.name} requested to add member to project: ${project.title}`, 'INFO')
        ))

        return { success: true }
    } catch (error) {
        return { error: "Failed to send request" }
    }
}

export async function addMemberToProject(projectId: string, userId: string) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) return { error: "Project not found" }

    const canEdit = session.user.role === Role.ADMIN || project.managerId === session.user.id
    if (!canEdit) return { error: "Unauthorized" }

    try {
        await prisma.project.update({
            where: { id: projectId },
            data: {
                members: {
                    connect: { id: userId }
                }
            }
        })

        // Notify user
        const { createNotification } = await import("./notification-actions")
        await createNotification(userId, `You were added to project: ${project.title}`, 'INFO')

        revalidatePath(`/dashboard/projects/${projectId}`)
        return { success: true }
    } catch (error) {
        return { error: "Failed to add member" }
    }
}

export async function removeMemberFromProject(projectId: string, userId: string) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) return { error: "Project not found" }

    const canEdit = session.user.role === Role.ADMIN || project.managerId === session.user.id
    if (!canEdit) return { error: "Unauthorized" }

    try {
        await prisma.project.update({
            where: { id: projectId },
            data: {
                members: {
                    disconnect: { id: userId }
                }
            }
        })

        // Notify user
        const { createNotification } = await import("./notification-actions")
        await createNotification(userId, `You were removed from project: ${project.title}`, 'WARNING')

        revalidatePath(`/dashboard/projects/${projectId}`)
        return { success: true }
    } catch (error) {
        return { error: "Failed to remove member" }
    }
}
