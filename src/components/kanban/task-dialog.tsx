'use client'

import { useState, useTransition, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { createTask, updateTask, deleteTask } from '@/lib/task-actions'
import { Task, Priority, User, Label as LabelType } from '@prisma/client'
import { Trash2 } from 'lucide-react'
import { AttachmentsSection } from './attachments-section'
import { CommentsSection } from './comments-section'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskWithDetails } from '@/types'
import { LabelManager } from './label-manager'

const taskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    priority: z.nativeEnum(Priority).optional().nullable(),
    assigneeId: z.string().optional(),
    dueDate: z.string().optional(),
})

interface TaskDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    projectId: string
    task?: TaskWithDetails
    defaultColumnId?: string
    members?: User[]
    labels?: LabelType[]
}

export function TaskDialog({ open, onOpenChange, projectId, task, defaultColumnId, members = [], labels = [] }: TaskDialogProps) {
    const [isPending, startTransition] = useTransition()
    const [activeTab, setActiveTab] = useState('details')
    const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([])

    const form = useForm<z.infer<typeof taskSchema>>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: '',
            description: '',
            priority: null,
            assigneeId: '',
            dueDate: '',
        },
    })

    useEffect(() => {
        if (open) {
            if (task) {
                form.reset({
                    title: task.title,
                    description: task.description || '',
                    priority: task.priority,
                    assigneeId: task.assigneeId || '',
                    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
                })
                setSelectedLabelIds(task.labels?.map(l => l.id) || [])
            } else {
                form.reset({
                    title: '',
                    description: '',
                    priority: null,
                    assigneeId: '',
                    dueDate: '',
                })
                setSelectedLabelIds([])
            }
            setActiveTab('details')
        }
    }, [open, task, form])

    const onSubmit = (data: z.infer<typeof taskSchema>) => {
        startTransition(async () => {
            const formData = new FormData()
            formData.append('title', data.title)
            formData.append('description', data.description || '')
            if (data.priority) formData.append('priority', data.priority)
            formData.append('projectId', projectId)
            if (data.assigneeId) formData.append('assigneeId', data.assigneeId)
            if (data.dueDate) formData.append('dueDate', data.dueDate)

            selectedLabelIds.forEach(id => formData.append('labels', id))

            if (!task && defaultColumnId) {
                formData.append('columnId', defaultColumnId)
            }

            if (task) {
                await updateTask(task.id, {
                    title: data.title,
                    description: data.description,
                    priority: data.priority,
                    assigneeId: data.assigneeId,
                    dueDate: data.dueDate ? new Date(data.dueDate) : null,
                    labelIds: selectedLabelIds
                })
            } else {
                await createTask(formData)
            }
            onOpenChange(false)
        })
    }

    const handleDelete = () => {
        if (!task) return
        if (confirm('Are you sure you want to delete this task?')) {
            startTransition(async () => {
                await deleteTask(task.id)
                onOpenChange(false)
            })
        }
    }

    const handleLabelToggle = (labelId: string) => {
        setSelectedLabelIds(prev =>
            prev.includes(labelId) ? prev.filter(id => id !== labelId) : [...prev, labelId]
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-bg-surface border-border-subtle">
                <DialogHeader>
                    <DialogTitle>{task ? 'Edit Task' : 'Create Task'}</DialogTitle>
                </DialogHeader>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="activity" disabled={!task}>Activity</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details">
                        <form id="task-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" {...form.register('title')} className="bg-bg-app" />
                                {form.formState.errors.title && (
                                    <p className="text-xs text-danger">{form.formState.errors.title.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" {...form.register('description')} className="bg-bg-app min-h-[100px]" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Select
                                        onValueChange={(val) => form.setValue('priority', val === 'no_priority' ? null : val as Priority)}
                                        value={form.watch('priority') || 'no_priority'}
                                    >
                                        <SelectTrigger className="bg-bg-app">
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="no_priority">No Priority</SelectItem>
                                            <SelectItem value={Priority.LOW}>Low</SelectItem>
                                            <SelectItem value={Priority.MEDIUM}>Medium</SelectItem>
                                            <SelectItem value={Priority.HIGH}>High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="assignee">Assignee</Label>
                                    <Select
                                        onValueChange={(val) => form.setValue('assigneeId', val === 'unassigned' ? '' : val)}
                                        value={form.watch('assigneeId') || 'unassigned'}
                                    >
                                        <SelectTrigger className="bg-bg-app">
                                            <SelectValue placeholder="Select assignee" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unassigned">Unassigned</SelectItem>
                                            {members.map(member => (
                                                <SelectItem key={member.id} value={member.id}>
                                                    {member.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dueDate">Due Date</Label>
                                <Input
                                    type="date"
                                    id="dueDate"
                                    {...form.register('dueDate')}
                                    className="bg-bg-app"
                                />
                            </div>

                            <LabelManager
                                projectId={projectId}
                                labels={labels}
                                selectedLabelIds={selectedLabelIds}
                                onLabelToggle={handleLabelToggle}
                            />
                        </form>
                    </TabsContent>

                    <TabsContent value="activity">
                        {task ? (
                            <div className="grid gap-6 mt-4">
                                <AttachmentsSection taskId={task.id} />
                                <Separator />
                                <CommentsSection taskId={task.id} />
                            </div>
                        ) : (
                            <div className="text-center py-8 text-text-muted">
                                Save the task to add attachments and comments.
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                <DialogFooter className="flex justify-between items-center sm:justify-between mt-6">
                    {task ? (
                        <Button
                            type="button"
                            variant="ghost"
                            className="text-danger hover:text-danger hover:bg-danger/10"
                            onClick={handleDelete}
                            disabled={isPending}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    ) : <div></div>}
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {activeTab === 'activity' ? 'Close' : 'Cancel'}
                        </Button>
                        {activeTab === 'details' && (
                            <Button type="submit" form="task-form" disabled={isPending} className="bg-accent text-accent-foreground hover:bg-accent/90">
                                {isPending ? 'Saving...' : (task ? 'Save Changes' : 'Create Task')}
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
