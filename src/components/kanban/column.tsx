import { Droppable, Draggable } from '@hello-pangea/dnd'
import { Task, User, Column } from '@prisma/client'
import { TaskCard } from './task-card'
import { Button } from '@/components/ui/button'
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditColumnDialog } from './edit-column-dialog'
import { deleteColumn } from '@/lib/column-actions'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

import { TaskWithDetails } from '@/types'

interface KanbanColumnProps {
    column: Column
    index: number
    tasks: TaskWithDetails[]
    onTaskClick: (task: TaskWithDetails) => void
    onAddTask: (columnId: string) => void
}

export function KanbanColumn({ column, index, tasks, onTaskClick, onAddTask }: KanbanColumnProps) {
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this column?')) {
            startTransition(async () => {
                await deleteColumn(column.id)
                router.refresh()
            })
        }
    }

    return (
        <>
            <Draggable draggableId={column.id} index={index}>
                {(provided) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="flex h-full max-h-full w-80 min-w-80 flex-col rounded-xl bg-bg-muted/30 border border-border-subtle shadow-sm overflow-hidden"
                    >
                        <div
                            {...provided.dragHandleProps}
                            className="flex items-center justify-between p-4 pb-3 cursor-grab active:cursor-grabbing border-b border-border-subtle/50"
                        >
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-sm text-text-primary">{column.title}</h3>
                                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-bg-muted px-1.5 text-xs font-medium text-text-muted border border-border-subtle">
                                    {tasks.length}
                                </span>
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-text-muted hover:text-text-primary"
                                    onClick={() => onAddTask(column.id)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-text-muted hover:text-text-primary">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Edit Title
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleDelete} className="text-danger focus:text-danger">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete Column
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        <Droppable droppableId={column.id} type="TASK">
                            {(provided, snapshot) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className={cn(
                                        "flex-1 flex flex-col gap-3 p-3 overflow-y-auto min-h-0 transition-colors rounded-b-xl no-scrollbar",
                                        snapshot.isDraggingOver && "bg-accent/5"
                                    )}
                                >
                                    {tasks.map((task, index) => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            index={index}
                                            onClick={onTaskClick}
                                        />
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                )}
            </Draggable>
            <EditColumnDialog
                column={column}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
            />
        </>
    )
}
