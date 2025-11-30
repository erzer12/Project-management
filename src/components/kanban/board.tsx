'use client'

import { DragDropContext, DropResult, Droppable } from '@hello-pangea/dnd'
import { Task, TaskStatus, User, Column, Label } from '@prisma/client'
import { useState, useEffect } from 'react'
import { moveTask } from '@/lib/task-actions'
import { reorderColumns } from '@/lib/column-actions'
import { useRouter } from 'next/navigation'
import { KanbanColumn } from './column'
import { TaskDialog } from './task-dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
// import { AddColumnButton } from './add-column-button' // Moved to header

import { TaskWithDetails } from '@/types'

interface KanbanBoardProps {
    projectId: string
    initialTasks: TaskWithDetails[]
    members: User[]
    columns: Column[]
    labels: Label[]
}

export function KanbanBoard({ projectId, initialTasks, members, columns: initialColumns, labels }: KanbanBoardProps) {
    const [tasks, setTasks] = useState(initialTasks)
    const [columns, setColumns] = useState(initialColumns)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedTask, setSelectedTask] = useState<TaskWithDetails | undefined>(undefined)
    const [newTaskColumnId, setNewTaskColumnId] = useState<string>('')

    const router = useRouter()

    useEffect(() => {
        setTasks(initialTasks)
        setColumns(initialColumns)
    }, [initialTasks, initialColumns])

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId, type } = result

        if (!destination) return

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return
        }

        // Column Reordering
        if (type === 'COLUMN') {
            const newColumns = Array.from(columns)
            const [removed] = newColumns.splice(source.index, 1)
            newColumns.splice(destination.index, 0, removed)

            setColumns(newColumns)

            const updates = newColumns.map((col, index) => ({ id: col.id, order: index }))
            await reorderColumns(projectId, updates)
            return
        }

        // Task Reordering
        const startColumn = columns.find(c => c.id === source.droppableId)
        const finishColumn = columns.find(c => c.id === destination.droppableId)

        if (!startColumn || !finishColumn) return

        // Optimistic Update
        const newTasks = Array.from(tasks)
        const taskIndex = newTasks.findIndex(t => t.id === draggableId)
        const task = newTasks[taskIndex]

        const updatedTask = { ...task, columnId: finishColumn.id }
        newTasks.splice(taskIndex, 1) // remove from old pos

        // Calculate new index in the flattened list is tricky without grouping
        // Simpler: Just update state and let server handle exact order persistence logic if complex
        // For visual correctness, we need to insert it into the correct visual position
        // But since `tasks` is a flat list, we rely on filtering in render.
        // We just update the task's columnId.

        // To support reordering within column, we need to know the order.
        // For now, let's just update columnId and let server append to end or handle order.
        // If we want true reordering, we need to update `order` field.

        // Let's assume we just update columnId for now to match previous functionality, 
        // but `moveTask` action supports order.

        setTasks([...newTasks, updatedTask]) // This puts it at end of list, visual order might be wrong until refresh

        await moveTask(draggableId, finishColumn.id, destination.index)
        router.refresh()
    }

    const handleTaskClick = (task: TaskWithDetails) => {
        setSelectedTask(task)
        setDialogOpen(true)
    }

    const handleAddTask = (columnId: string) => {
        setSelectedTask(undefined)
        setNewTaskColumnId(columnId)
        setDialogOpen(true)
    }

    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="board" direction="horizontal" type="COLUMN">
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="flex h-full gap-6 overflow-x-auto px-6 pb-2"
                        >
                            {columns.map((column, index) => (
                                <KanbanColumn
                                    key={column.id}
                                    column={column}
                                    index={index}
                                    tasks={tasks.filter(t => t.columnId === column.id).sort((a, b) => a.order - b.order)}
                                    onTaskClick={handleTaskClick}
                                    onAddTask={handleAddTask}
                                />
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            <TaskDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                projectId={projectId}
                task={selectedTask}
                defaultColumnId={newTaskColumnId}
                members={members}
                labels={labels}
            />
        </>
    )
}
