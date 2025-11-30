'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { createNotification } from "./notification-actions"

export async function createComment(taskId: string, content: string, parentId?: string) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    if (!content.trim()) return { error: "Content is required" }

    try {
        await prisma.comment.create({
            data: {
                content,
                taskId,
                authorId: session.user.id,
                parentId
            },
        })

        // Notify task assignee if it's not the commenter
        const task = await prisma.task.findUnique({ where: { id: taskId } })
        if (task && task.assigneeId && task.assigneeId !== session.user.id) {
            await createNotification(task.assigneeId, `New comment on task: ${task.title}`, 'INFO')
        }

        // Notify parent comment author if it's a reply
        if (parentId) {
            const parentComment = await prisma.comment.findUnique({ where: { id: parentId } })
            if (parentComment && parentComment.authorId !== session.user.id && parentComment.authorId !== task?.assigneeId) {
                await createNotification(parentComment.authorId, `New reply to your comment on task: ${task?.title}`, 'INFO')
            }
        }

        revalidatePath(`/dashboard`)
        return { success: true }
    } catch (error) {
        return { error: "Failed to add comment" }
    }
}

export async function getComments(taskId: string) {
    const session = await auth()
    if (!session?.user) return []

    return await prisma.comment.findMany({
        where: { taskId, parentId: null },
        include: {
            author: {
                select: { name: true, image: true }
            },
            replies: {
                include: {
                    author: {
                        select: { name: true, image: true }
                    }
                },
                orderBy: { createdAt: 'asc' }
            }
        },
        orderBy: { createdAt: 'desc' }
    })
}
