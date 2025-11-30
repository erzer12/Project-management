'use client'

import { useState, useEffect, useTransition } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, UserPlus, Check, Users } from "lucide-react"
import { getAssignableUsers } from "@/lib/user-actions"
import { addMemberToProject, removeMemberFromProject } from "@/lib/project-actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

interface User {
    id: string
    name: string | null
    email: string
    image: string | null
}

interface ManageMembersDialogProps {
    projectId: string
    currentMembers: User[]
    managerId: string
}

export function ManageMembersDialog({ projectId, currentMembers, managerId }: ManageMembersDialogProps) {
    const [open, setOpen] = useState(false)
    const [assignableUsers, setAssignableUsers] = useState<User[]>([])
    const [isPending, startTransition] = useTransition()
    const [activeTab, setActiveTab] = useState("add")

    useEffect(() => {
        if (open) {
            startTransition(async () => {
                const users = await getAssignableUsers()
                setAssignableUsers(users)
            })
        }
    }, [open])

    const handleAddMember = (userId: string) => {
        startTransition(async () => {
            const result = await addMemberToProject(projectId, userId)
            if (result.success) {
                toast.success("Member added")
            } else {
                toast.error(result.error || "Failed to add member")
            }
        })
    }

    const handleRemoveMember = (userId: string) => {
        startTransition(async () => {
            const result = await removeMemberFromProject(projectId, userId)
            if (result.success) {
                toast.success("Member removed")
            } else {
                toast.error(result.error || "Failed to remove member")
            }
        })
    }

    const nonMembers = assignableUsers.filter(user => !currentMembers.some(m => m.id === user.id))

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-dashed border-border-strong text-text-muted hover:text-text-primary hover:border-text-primary">
                    <Plus className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Manage Team Members</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="add" className="flex-1 flex flex-col" onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="add">Add Members</TabsTrigger>
                        <TabsTrigger value="current">Current Team ({currentMembers.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="add" className="flex-1 flex flex-col mt-4 data-[state=inactive]:hidden">
                        <Command className="border rounded-md flex-1">
                            <CommandInput placeholder="Search users..." />
                            <CommandList>
                                <CommandEmpty>No users found.</CommandEmpty>
                                <CommandGroup heading="Available Users">
                                    {nonMembers.map((user) => (
                                        <CommandItem key={user.id} className="flex items-center justify-between py-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={user.image || ""} />
                                                    <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{user.name}</span>
                                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                                onClick={() => handleAddMember(user.id)}
                                                disabled={isPending}
                                            >
                                                <UserPlus className="h-4 w-4" />
                                            </Button>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </TabsContent>

                    <TabsContent value="current" className="flex-1 overflow-y-auto mt-4 data-[state=inactive]:hidden">
                        <div className="space-y-2">
                            {currentMembers.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-3 rounded-md border bg-card">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.image || ""} />
                                            <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{user.name}</span>
                                            <span className="text-xs text-muted-foreground">{user.email}</span>
                                        </div>
                                    </div>
                                    {user.id !== managerId && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => handleRemoveMember(user.id)}
                                            disabled={isPending}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            {currentMembers.length === 0 && (
                                <p className="text-center text-muted-foreground py-8">No members yet.</p>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
