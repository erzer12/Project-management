'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function uploadAttachment(formData: FormData) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    const file = formData.get('file') as File
    const taskId = formData.get('taskId') as string

    if (!file || !taskId) return { error: "Missing fields" }

    // Mock upload: In a real app, upload to S3 here and get URL
    const mockUrl = `https://fake-s3-bucket.com/${file.name}`

    try {
        await prisma.attachment.create({
            data: {
                url: mockUrl,
                filename: file.name,
                size: file.size,
                mimeType: file.type,
                taskId,
                uploadedById: session.user.id,
            },
        })
        revalidatePath('/dashboard/projects/[projectId]')
        return { success: true }
    } catch (error) {
        return { error: "Failed to upload attachment" }
    }
}
