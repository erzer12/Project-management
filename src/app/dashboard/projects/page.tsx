import { auth } from "@/auth"
import { CreateProjectDialog } from "@/components/projects/create-project-dialog"
import { ProjectList } from "@/components/projects/project-list"
import { getProjects } from "@/lib/project-actions"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"

export default async function ProjectsPage() {
    const session = await auth()
    if (!session?.user) redirect('/login')

    const projects = await getProjects()
    const canCreate = session.user.role === Role.ADMIN

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                <CreateProjectDialog canCreate={canCreate} />
            </div>
            <ProjectList projects={projects} variant="projects" />
        </div>
    )
}
