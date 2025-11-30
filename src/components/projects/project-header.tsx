'use client'

import { Project, User, ProjectStatus, Role } from "@prisma/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ProjectStatusSelect } from "./project-status-select"
import { AddColumnButton } from "@/components/kanban/add-column-button"
import { ManageMembersDialog } from "./manage-members-dialog"
import { cn } from "@/lib/utils"

interface ProjectHeaderProps {
    project: Project & {
        members: User[]
    }
    currentUser: User
}

export function ProjectHeader({ project, currentUser }: ProjectHeaderProps) {
    const canEdit = currentUser.role === Role.ADMIN || project.managerId === currentUser.id

    return (
        <div className="flex flex-col gap-4 border-b border-border-subtle bg-bg-surface px-6 py-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-text-primary">{project.title}</h1>
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-2 overflow-hidden">
                            {project.members.slice(0, 5).map((member) => (
                                <Avatar key={member.id} className="inline-block h-8 w-8 ring-2 ring-bg-surface">
                                    <AvatarImage src={member.image || ""} />
                                    <AvatarFallback>{member.name?.[0]}</AvatarFallback>
                                </Avatar>
                            ))}
                            {project.members.length > 5 && (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-muted ring-2 ring-bg-surface text-xs font-medium text-text-muted">
                                    +{project.members.length - 5}
                                </div>
                            )}
                        </div>
                        {canEdit && (
                            <ManageMembersDialog
                                projectId={project.id}
                                currentMembers={project.members}
                                managerId={project.managerId}
                            />
                        )}
                        {project.members.length === 0 && (
                            <span className="text-sm text-text-muted">No members assigned</span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {canEdit && (
                        <>
                            <ProjectStatusSelect
                                projectId={project.id}
                                initialStatus={project.status}
                                canEdit={true}
                            />
                            <div className="h-6 w-px bg-border-subtle" />
                            <AddColumnButton projectId={project.id} />
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
