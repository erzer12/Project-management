'use client'

import { Draggable } from '@hello-pangea/dnd'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from '@/components/ui/badge'
import { Task, User, Priority } from '@prisma/client'
import { cn } from '@/lib/utils'

import { MessageSquare, Paperclip } from 'lucide-react'

import { TaskWithDetails } from '@/types'

interface TaskCardProps {
    task: TaskWithDetails
    index: number
    onClick: (task: any) => void
}

const priorityColors: Record<Priority, string> = {
    [Priority.HIGH]: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900",
    [Priority.MEDIUM]: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-900",
    [Priority.LOW]: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-900",
}

export function TaskCard({ task, index, onClick }: TaskCardProps) {
    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => onClick(task)}
                    className={cn(
                        "group relative",
                        snapshot.isDragging && "z-50"
                    )}
                >
                    <Card className={cn(
                        "cursor-grab active:cursor-grabbing border-border-subtle bg-bg-surface shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[2px]",
                        snapshot.isDragging && "shadow-lg ring-2 ring-accent rotate-2 opacity-90"
                    )}>
                        <CardHeader className="p-4 pb-2 space-y-2">
                            <div className="flex justify-between items-start gap-2">
                                <CardTitle className="text-sm font-medium leading-tight text-text-primary line-clamp-2">
                                    {task.title}
                                </CardTitle>
                            </div>
                            {task.labels && task.labels.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {task.labels.map(label => (
                                        <div
                                            key={label.id}
                                            className="h-1.5 w-8 rounded-full"
                                            style={{ backgroundColor: label.color }}
                                            title={label.name}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-3 text-text-muted">
                                    {task.comments.length > 0 && (
                                        <div className="flex items-center gap-1 text-xs">
                                            <MessageSquare className="h-3 w-3" />
                                            <span>{task.comments.length}</span>
                                        </div>
                                    )}
                                    {task.attachments.length > 0 && (
                                        <div className="flex items-center gap-1 text-xs">
                                            <Paperclip className="h-3 w-3" />
                                            <span>{task.attachments.length}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-subtle">
                                <Badge
                                    variant="outline"
                                    className={cn("text-[10px] px-1.5 py-0.5 h-auto font-medium border", task.priority && priorityColors[task.priority])}
                                >
                                    {task.priority}
                                </Badge>
                                {task.assignee && (
                                    <div className="flex items-center gap-2" title={task.assignee.name || 'Assignee'}>
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={task.assignee.image || ""} />
                                            <AvatarFallback className="text-[10px] bg-accent/10 text-accent-foreground">
                                                {task.assignee.name?.charAt(0) || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </Draggable>
    )
}
