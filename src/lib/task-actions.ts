'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { TaskStatus, Priority, Role, Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { createNotification, notifyProjectMembers } from "./notification-actions"

// Helper to check permissions
async function checkPermission(projectId: string, userId: string, role: Role) {
    if (role === Role.ADMIN) return true

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { members: true }
    })

    if (!project) return false

    if (role === Role.MANAGER) {
        return project.managerId === userId
    }

    // MEMBER
    return project.members.some((m: { id: string }) => m.id === userId)
}

export async function getTasks(projectId: string) {
    const session = await auth()
    if (!session?.user) return []

    return await prisma.task.findMany({
        where: { projectId },
        include: {
            assignee: true,
            comments: { include: { author: true } },
            attachments: true,
            labels: true
        },
        orderBy: { order: 'asc' }
    })
}

export async function moveTask(taskId: string, columnId: string, newOrder: number) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    try {
        const task = await prisma.task.findUnique({ where: { id: taskId } })
        if (!task) return { error: "Task not found" }

        const hasPermission = await checkPermission(task.projectId, session.user.id, session.user.role as Role)
        if (!hasPermission) return { error: "Forbidden" }

        await prisma.task.update({
            where: { id: taskId },
            data: {
                columnId,
                order: newOrder
            },
        })

        if (task.columnId !== columnId && task.assigneeId && task.assigneeId !== session.user.id) {
            const newColumn = await prisma.column.findUnique({ where: { id: columnId } })
            if (newColumn) {
                await createNotification(task.assigneeId, `Task "${task.title}" moved to ${newColumn.title}`, 'INFO')
            }
        }

        await notifyProjectMembers(task.projectId, `${session.user.name} moved task "${task.title}"`, session.user.id)

        revalidatePath(`/dashboard/projects/${task.projectId}`)
        return { success: true }
    } catch (error) {
        return { error: "Failed to move task" }
    }
}

export async function createTask(formData: FormData) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    const title = formData.get('title') as string
    const projectId = formData.get('projectId') as string
    const priorityRaw = formData.get('priority')
    const priority = priorityRaw ? priorityRaw as Priority : null
    const description = formData.get('description') as string
    const assigneeId = formData.get('assigneeId') as string
    const columnId = formData.get('columnId') as string
    const dueDateRaw = formData.get('dueDate') as string
    const labelIds = formData.getAll('labels') as string[]

    if (!title || !projectId) return { error: "Missing fields" }

    const hasPermission = await checkPermission(projectId, session.user.id, session.user.role as Role)
    if (!hasPermission) return { error: "Forbidden" }

    try {
        const lastTask = await prisma.task.findFirst({
            where: { columnId: columnId || undefined, projectId },
            orderBy: { order: 'desc' }
        })
        const newOrder = lastTask ? lastTask.order + 1 : 0

        const task = await prisma.task.create({
            data: {
                title,
                description,
                projectId,
                priority: priority ?? undefined,
                status: TaskStatus.TODO,
                columnId: columnId || undefined,
                order: newOrder,
                assigneeId: assigneeId || undefined,
                dueDate: dueDateRaw ? new Date(dueDateRaw) : undefined,
                labels: {
                    connect: labelIds.map(id => ({ id }))
                }
            }
        })

        if (assigneeId && assigneeId !== session.user.id) {
            await createNotification(assigneeId, `You were assigned to task: ${title}`, 'INFO')
        }

        await notifyProjectMembers(projectId, `${session.user.name} created task "${title}"`, session.user.id)

        revalidatePath(`/dashboard/projects/${projectId}`)
        return { success: true }
    } catch (error) {
        return { error: "Failed to create task" }
    }
}

export async function updateTask(taskId: string, data: { title?: string, description?: string, priority?: Priority | null, assigneeId?: string | null, dueDate?: Date | null, labelIds?: string[] }) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    try {
        const task = await prisma.task.findUnique({ where: { id: taskId }, include: { labels: true } })
        if (!task) return { error: "Task not found" }

        const hasPermission = await checkPermission(task.projectId, session.user.id, session.user.role as Role)
        if (!hasPermission) return { error: "Forbidden" }

        const updateData: any = {
            title: data.title,
            description: data.description,
            priority: data.priority,
            assigneeId: data.assigneeId === undefined ? undefined : data.assigneeId,
            dueDate: data.dueDate
        }

        // Handle labels update if provided
        if (data.labelIds) {
            updateData.labels = {
                set: data.labelIds.map(id => ({ id }))
            }
        }

        await prisma.task.update({
            where: { id: taskId },
            data: updateData
        })

        if (data.assigneeId && data.assigneeId !== session.user.id && data.assigneeId !== task.assigneeId) {
            await createNotification(data.assigneeId, `You were assigned to task: ${task.title}`, 'INFO')
        }

        await notifyProjectMembers(task.projectId, `${session.user.name} updated task "${task.title}"`, session.user.id)

        revalidatePath(`/dashboard/projects/${task.projectId}`)
        return { success: true }
    } catch (error) {
        return { error: "Failed to update task" }
    }
}

export async function createLabel(projectId: string, name: string, color: string) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    try {
        await prisma.label.create({
            data: {
                name,
                color,
                projectId
            }
        })
        revalidatePath(`/dashboard/projects/${projectId}`)
        return { success: true }
    } catch (error) {
        return { error: "Failed to create label" }
    }
}

export async function getLabels(projectId: string) {
    const session = await auth()
    if (!session?.user) return []

    return await prisma.label.findMany({
        where: { projectId }
    })
}

export async function deleteTask(taskId: string) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    try {
        const task = await prisma.task.findUnique({ where: { id: taskId } })
        if (!task) return { error: "Task not found" }

        const hasPermission = await checkPermission(task.projectId, session.user.id, session.user.role as Role)
        if (!hasPermission) return { error: "Forbidden" }

        await prisma.task.delete({ where: { id: taskId } })

        await notifyProjectMembers(task.projectId, `${session.user.name} deleted task "${task.title}"`, session.user.id)

        revalidatePath(`/dashboard/projects/${task.projectId}`)
        return { success: true }
    } catch (error) {
        return { error: "Failed to delete task" }
    }
}
