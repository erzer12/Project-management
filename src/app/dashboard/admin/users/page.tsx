import { auth } from "@/auth"
import { getUsers, updateUserRole } from "@/lib/user-actions"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"
import { UserTable } from "./user-table"

export default async function AdminUsersPage() {
    const session = await auth()
    if (!session?.user || session.user.role !== Role.ADMIN) {
        redirect('/')
    }

    const users = await getUsers()

    return (
        <div className="container mx-auto py-10 max-w-5xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text-primary">User Management</h1>
                <p className="text-text-muted">Manage user roles and access.</p>
            </div>
            <div className="rounded-xl border border-border-subtle bg-bg-surface shadow-sm overflow-hidden">
                <UserTable users={users} />
            </div>
        </div>
    )
}
