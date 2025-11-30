'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function uploadFile(formData: FormData) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    const file = formData.get("file") as File
    const taskId = formData.get("taskId") as string

    if (!file || !taskId) {
        return { error: "Missing file or task ID" }
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Ensure uploads directory exists
    const uploadDir = join(process.cwd(), "public", "uploads")
    await mkdir(uploadDir, { recursive: true })

    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const filename = uniqueSuffix + '-' + file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filepath = join(uploadDir, filename)

    try {
        await writeFile(filepath, buffer)

        const url = `/uploads/${filename}`

        await prisma.attachment.create({
            data: {
                url,
                filename: file.name,
                size: file.size,
                mimeType: file.type,
                taskId,
                uploadedById: session.user.id
            }
        })

        revalidatePath(`/dashboard`)
        return { success: true }
    } catch (error) {
        console.error("Upload error:", error)
        return { error: "Failed to upload file" }
    }
}

export async function deleteAttachment(attachmentId: string) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    try {
        await prisma.attachment.delete({
            where: { id: attachmentId }
        })
        revalidatePath(`/dashboard`)
        return { success: true }
    } catch (error) {
        return { error: "Failed to delete attachment" }
    }
}

export async function getAttachments(taskId: string) {
    const session = await auth()
    if (!session?.user) return []

    return await prisma.attachment.findMany({
        where: { taskId },
        orderBy: { createdAt: 'desc' }
    })
}
