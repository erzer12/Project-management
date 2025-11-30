'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function getUsers() {
    const session = await auth()
    if (!session?.user || session.user.role !== Role.ADMIN) return []

    return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    })
}

export async function getManagers() {
    const session = await auth()
    if (!session?.user) return []

    return await prisma.user.findMany({
        where: { role: Role.MANAGER },
        orderBy: { name: 'asc' }
    })
}

export async function updateUserRole(userId: string, role: Role) {
    const session = await auth()
    if (!session?.user || session.user.role !== Role.ADMIN) return { error: "Unauthorized" }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role }
        })
        revalidatePath('/dashboard/admin/users')
        return { success: true }
    } catch (error) {
        return { error: "Failed to update user role" }
    }
}

import bcrypt from "bcryptjs"

export async function updateProfile(data: { name: string, bio?: string, jobTitle?: string, image?: string }) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name: data.name,
                bio: data.bio,
                jobTitle: data.jobTitle,
                image: data.image
            }
        })
        revalidatePath('/profile')
        return { success: true }
    } catch (error) {
        return { error: "Failed to update profile" }
    }
}

export async function changePassword(currentPassword: string, newPassword: string) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    try {
        const user = await prisma.user.findUnique({ where: { id: session.user.id } })
        if (!user || !user.password) return { error: "User not found" }

        const passwordsMatch = await bcrypt.compare(currentPassword, user.password)
        if (!passwordsMatch) return { error: "Incorrect current password" }

        const hashedPassword = await bcrypt.hash(newPassword, 10)
        await prisma.user.update({
            where: { id: session.user.id },
            data: { password: hashedPassword }
        })

        return { success: true }
    } catch (error) {
        return { error: "Failed to change password" }
    }
}

import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function uploadAvatar(formData: FormData) {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized" }

    const file = formData.get("file") as File
    if (!file) return { error: "No file uploaded" }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = join(process.cwd(), "public", "uploads", "avatars")
    await mkdir(uploadDir, { recursive: true })

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const filename = uniqueSuffix + '-' + file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filepath = join(uploadDir, filename)

    try {
        await writeFile(filepath, buffer)
        const url = `/uploads/avatars/${filename}`

        await prisma.user.update({
            where: { id: session.user.id },
            data: { image: url }
        })

        revalidatePath('/profile')
        return { success: true, url }
    } catch (error) {
        return { error: "Failed to upload avatar" }
    }
}

export async function verifyUser(userId: string, status: 'ACTIVE' | 'REJECTED') {
    const session = await auth()
    if (!session?.user || session.user.role !== Role.ADMIN) return { error: "Unauthorized" }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { status }
        })
        revalidatePath('/dashboard/admin/users')
        return { success: true }
    } catch (error) {
        return { error: "Failed to update user status" }
    }
}

export async function searchUsers(query: string) {
    const session = await auth()
    if (!session?.user) return []

    if (query.length < 2) return []

    return await prisma.user.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } }
            ],
            id: { not: session.user.id },
            role: { not: Role.ADMIN }
        },
        take: 5,
        select: {
            id: true,
            name: true,
            email: true,
            image: true
        }
    })
}

export async function getAssignableUsers() {
    const session = await auth()
    if (!session?.user) return []

    return await prisma.user.findMany({
        where: {
            id: { not: session.user.id },
            role: { not: Role.ADMIN }
        },
        select: {
            id: true,
            name: true,
            email: true,
            image: true
        },
        orderBy: { name: 'asc' }
    })
}
