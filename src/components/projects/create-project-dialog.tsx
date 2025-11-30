'use client'

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createProject } from "@/lib/project-actions"
import { getUsers, getManagers } from "@/lib/user-actions"
import { Plus } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useEffect } from "react"
import { useFormStatus } from "react-dom"

export function CreateProjectDialog({ canCreate }: { canCreate: boolean }) {
    const [open, setOpen] = useState(false)
    const [managers, setManagers] = useState<{ id: string; name: string | null }[]>([])
    const [allUsers, setAllUsers] = useState<{ id: string; name: string | null }[]>([])
    const [selectedMembers, setSelectedMembers] = useState<string[]>([])

    useEffect(() => {
        if (open && canCreate) {
            getManagers().then(setManagers)
            getUsers().then(setAllUsers)
        }
    }, [open, canCreate])

    if (!canCreate) return null

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Project</DialogTitle>
                    <DialogDescription>
                        Create a new project and assign a manager.
                    </DialogDescription>
                </DialogHeader>
                <form
                    action={async (formData) => {
                        const res = await createProject(formData)
                        if (res?.success) {
                            setOpen(false)
                        } else {
                            alert(res?.error)
                        }
                    }}
                >
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Title
                            </Label>
                            <Input
                                id="title"
                                name="title"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Input
                                id="description"
                                name="description"
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="manager" className="text-right">
                                Manager
                            </Label>
                            <select
                                id="managerId"
                                name="managerId"
                                className="col-span-3 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                required
                            >
                                <option value="">Select a manager</option>
                                {managers.map((manager) => (
                                    <option key={manager.id} value={manager.id}>
                                        {manager.name || manager.id}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="text-right pt-2">
                                Members
                            </Label>
                            <div className="col-span-3 border rounded-md p-2 h-40 overflow-y-auto space-y-2">
                                {allUsers.map((user) => (
                                    <div key={user.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`member-${user.id}`}
                                            name="members"
                                            value={user.id}
                                        />
                                        <Label htmlFor={`member-${user.id}`} className="font-normal cursor-pointer">
                                            {user.name || user.id}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <SubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Creating...' : 'Create Project'}
        </Button>
    )
}
