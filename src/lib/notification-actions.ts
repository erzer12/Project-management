'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getNotifications() {
    const session = await auth()
    if (!session?.user) return []

    return await prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 20
    })
}

export async function markAsRead(notificationId: string) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    try {
        await prisma.notification.update({
            where: { id: notificationId },
            data: { read: true },
        })
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        return { error: "Failed to mark as read" }
    }
}

export async function createNotification(userId: string, message: string, type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR' = 'INFO') {
    // Internal use only, no auth check needed as it's called by other actions
    try {
        await prisma.notification.create({
            data: {
                userId,
                message,
                type,
            }
        })
    } catch (error) {
        console.error("Failed to create notification", error)
    }
}

export async function notifyProjectMembers(projectId: string, message: string, excludeUserId?: string, type: string = 'PROJECT_UPDATE') {
    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { members: true, manager: true }
        })

        if (!project) return

        const recipients = [...project.members, project.manager]
            .filter(user => user.id !== excludeUserId)
            .map(user => user.id)

        // Unique recipients
        const uniqueRecipients = Array.from(new Set(recipients))

        for (const userId of uniqueRecipients) {
            // Smart Grouping: Check for recent unread notification of same type
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

            const existingNotification = await prisma.notification.findFirst({
                where: {
                    userId,
                    type,
                    read: false,
                    createdAt: { gt: fiveMinutesAgo }
                },
                orderBy: { createdAt: 'desc' }
            })

            if (existingNotification) {
                // Update existing notification
                // If message is "User updated task", change to "User made multiple updates"
                let newMessage = existingNotification.message
                if (!newMessage.includes("multiple updates")) {
                    newMessage = `${message.split(' ')[0]} made multiple updates in ${project.title}`
                }

                await prisma.notification.update({
                    where: { id: existingNotification.id },
                    data: {
                        message: newMessage,
                        createdAt: new Date() // Bump timestamp
                    }
                })
            } else {
                // Create new notification
                await prisma.notification.create({
                    data: {
                        userId,
                        message,
                        type
                    }
                })
            }
        }
    } catch (error) {
        console.error("Failed to notify project members", error)
    }
}
