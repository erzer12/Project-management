'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { revalidatePath } from "next/cache"

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

    return project.members.some((m: { id: string }) => m.id === userId)
}

export async function createColumn(projectId: string, title: string) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    const hasPermission = await checkPermission(projectId, session.user.id, session.user.role as Role)
    if (!hasPermission) return { error: "Forbidden" }

    try {
        const lastColumn = await prisma.column.findFirst({
            where: { projectId },
            orderBy: { order: 'desc' }
        })

        const newOrder = lastColumn ? lastColumn.order + 1 : 0

        await prisma.column.create({
            data: {
                title,
                projectId,
                order: newOrder
            }
        })

        const { notifyProjectMembers } = await import("./notification-actions")
        await notifyProjectMembers(projectId, `${session.user.name} created column "${title}"`, session.user.id)

        revalidatePath(`/dashboard/projects/${projectId}`)
        return { success: true }
    } catch (error) {
        return { error: "Failed to create column" }
    }
}

export async function updateColumn(columnId: string, title: string) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    try {
        const column = await prisma.column.findUnique({ where: { id: columnId } })
        if (!column) return { error: "Column not found" }

        const hasPermission = await checkPermission(column.projectId, session.user.id, session.user.role as Role)
        if (!hasPermission) return { error: "Forbidden" }

        await prisma.column.update({
            where: { id: columnId },
            data: { title }
        })

        revalidatePath(`/dashboard/projects/${column.projectId}`)
        return { success: true }
    } catch (error) {
        return { error: "Failed to update column" }
    }
}

export async function deleteColumn(columnId: string) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    try {
        const column = await prisma.column.findUnique({ where: { id: columnId } })
        if (!column) return { error: "Column not found" }

        const hasPermission = await checkPermission(column.projectId, session.user.id, session.user.role as Role)
        if (!hasPermission) return { error: "Forbidden" }

        await prisma.column.delete({ where: { id: columnId } })

        const { notifyProjectMembers } = await import("./notification-actions")
        await notifyProjectMembers(column.projectId, `${session.user.name} deleted column "${column.title}"`, session.user.id)

        revalidatePath(`/dashboard/projects/${column.projectId}`)
        return { success: true }
    } catch (error) {
        return { error: "Failed to delete column" }
    }
}

export async function reorderColumns(projectId: string, newOrder: { id: string, order: number }[]) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    const hasPermission = await checkPermission(projectId, session.user.id, session.user.role as Role)
    if (!hasPermission) return { error: "Forbidden" }

    try {
        await prisma.$transaction(
            newOrder.map((item) =>
                prisma.column.update({
                    where: { id: item.id },
                    data: { order: item.order },
                })
            )
        )
        revalidatePath(`/dashboard/projects/${projectId}`)
        return { success: true }
    } catch (error) {
        return { error: "Failed to reorder columns" }
    }
}
