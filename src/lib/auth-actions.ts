'use server'

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { UserStatus } from "@prisma/client"

export async function registerUser(data: { name: string, email: string, password: string }) {
    try {
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        })

        if (existingUser) {
            return { error: "Email already in use" }
        }

        const hashedPassword = await bcrypt.hash(data.password, 10)

        await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                status: UserStatus.PENDING
            }
        })

        return { success: true }
    } catch (error) {
        return { error: "Failed to create account" }
    }
}
