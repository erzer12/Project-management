import { auth } from "@/auth"
import { KanbanBoard } from "@/components/kanban/board"
import { getTasks } from "@/lib/task-actions"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ProjectStatusSelect } from "@/components/projects/project-status-select"
import { Role } from "@prisma/client"
import { ProjectHeader } from "@/components/projects/project-header"

export default async function ProjectDetailsPage({ params }: { params: Promise<{ projectId: string }> }) {
    const session = await auth()
    if (!session?.user) redirect('/login')

    const { projectId } = await params
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            manager: true,
            members: true,
            columns: {
                orderBy: {
                    order: 'asc'
                }
            }
        }
    })

    if (!project) return <div>Project not found</div>

    const tasks = await getTasks(projectId)
    const labels = await prisma.label.findMany({ where: { projectId } })
    const canEdit = session.user.role === Role.ADMIN || project.managerId === session.user.id

    // ...

    return (
        <div className="h-full flex flex-col">
            <ProjectHeader project={project} currentUser={session.user as any} />
            <div className="flex-1 overflow-hidden">
                <KanbanBoard
                    projectId={projectId}
                    initialTasks={tasks}
                    members={project.members}
                    columns={project.columns}
                    labels={labels}
                />
            </div>
        </div>
    )
}
