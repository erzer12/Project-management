'use client'

import { User, Role, UserStatus } from "@prisma/client"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { updateUserRole, verifyUser } from "@/lib/user-actions"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { toast } from "sonner"

export function UserTable({ users }: { users: User[] }) {
    if (users.length === 0) {
        return (
            <div className="text-center py-10 text-text-muted">
                No users found.
            </div>
        )
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="hover:bg-transparent border-border-subtle">
                    <TableHead className="w-[200px]">Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[150px]">Role</TableHead>
                    <TableHead className="w-[150px] text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user) => (
                    <UserRow key={user.id} user={user} />
                ))}
            </TableBody>
        </Table>
    )
}

function UserRow({ user }: { user: User }) {
    const [role, setRole] = useState(user.role)
    const [status, setStatus] = useState(user.status)
    const [loading, setLoading] = useState(false)

    const handleRoleChange = async (newRole: Role) => {
        setLoading(true)
        const res = await updateUserRole(user.id, newRole)
        if (res?.success) {
            setRole(newRole)
            toast.success("Role updated")
        } else {
            toast.error("Failed to update role")
        }
        setLoading(false)
    }

    const handleVerify = async (newStatus: 'ACTIVE' | 'REJECTED') => {
        setLoading(true)
        const res = await verifyUser(user.id, newStatus)
        if (res?.success) {
            setStatus(newStatus)
            toast.success(`User ${newStatus.toLowerCase()}`)
        } else {
            toast.error("Failed to update status")
        }
        setLoading(false)
    }

    return (
        <TableRow className="border-border-subtle hover:bg-bg-muted/50">
            <TableCell className="font-medium text-text-primary">{user.name || 'N/A'}</TableCell>
            <TableCell className="text-text-muted">{user.email}</TableCell>
            <TableCell>
                <Badge variant={status === 'ACTIVE' ? 'default' : status === 'PENDING' ? 'secondary' : 'destructive'}>
                    {status}
                </Badge>
            </TableCell>
            <TableCell>
                <Select
                    value={role}
                    onValueChange={(val) => handleRoleChange(val as Role)}
                    disabled={loading}
                >
                    <SelectTrigger className="w-[130px] h-8 bg-bg-app border-border-strong">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                        <SelectItem value={Role.MANAGER}>Manager</SelectItem>
                        <SelectItem value={Role.MEMBER}>Member</SelectItem>
                    </SelectContent>
                </Select>
            </TableCell>
            <TableCell className="text-right">
                {status === 'PENDING' && (
                    <div className="flex justify-end gap-2">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20"
                            onClick={() => handleVerify('ACTIVE')}
                            disabled={loading}
                        >
                            <Check className="h-4 w-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
                            onClick={() => handleVerify('REJECTED')}
                            disabled={loading}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </TableCell>
        </TableRow>
    )
}
