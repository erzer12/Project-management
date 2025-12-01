'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Project, User, Task } from "@prisma/client"
import { formatDistanceToNow } from "date-fns"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Search, ArrowRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

type ProjectWithDetails = Project & {
    manager: User
    members: User[]
    _count: {
        tasks: number
    }
}

export function ProjectList({ projects, showSearch = true, variant = 'dashboard' }: { projects: any[], showSearch?: boolean, variant?: 'dashboard' | 'projects' }) {
    const [search, setSearch] = useState("")

    const filteredProjects = projects.filter(project =>
        project.title.toLowerCase().includes(search.toLowerCase()) ||
        project.status.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            {showSearch && (
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search projects by name or status..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 max-w-sm bg-bg-surface"
                    />
                </div>
            )}

            {filteredProjects.length === 0 ? (
                <div className="flex h-[400px] flex-col items-center justify-center rounded-md border border-dashed text-center">
                    <h3 className="text-lg font-semibold text-text-primary">No projects found</h3>
                    <p className="text-sm text-text-muted">
                        {search ? "Try adjusting your search query" : "Create a project to get started"}
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredProjects.map((project) => (
                        <Card key={project.id} className="flex flex-col transition-all hover:shadow-md bg-bg-surface border-border-subtle">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="line-clamp-1">
                                            {variant === 'projects' ? (
                                                <Link href={`/dashboard/projects/${project.id}`} className="hover:underline decoration-text-primary underline-offset-4">
                                                    {project.title}
                                                </Link>
                                            ) : (
                                                <Link href={`/dashboard/projects/${project.id}/analysis`} className="hover:underline decoration-text-primary underline-offset-4">
                                                    {project.title}
                                                </Link>
                                            )}
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                                            {project.description || "No description provided"}
                                        </CardDescription>
                                    </div>
                                    <Badge variant={project.status === 'ACTIVE' ? 'default' : 'secondary'} className="capitalize">
                                        {project.status.toLowerCase()}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-text-muted">Tasks</span>
                                        <span className="font-medium text-text-primary">{project._count?.tasks || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-text-muted">Members</span>
                                        <div className="flex -space-x-2 overflow-hidden">
                                            {project.members.slice(0, 3).map((member: User) => (
                                                <Avatar key={member.id} className="inline-block h-6 w-6 ring-2 ring-bg-surface">
                                                    <AvatarImage src={member.image || ""} />
                                                    <AvatarFallback>{member.name?.[0]}</AvatarFallback>
                                                </Avatar>
                                            ))}
                                            {project.members.length > 3 && (
                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-bg-muted ring-2 ring-bg-surface text-xs font-medium text-text-muted">
                                                    +{project.members.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            {variant === 'dashboard' && (
                                <CardFooter className="border-t border-border-subtle bg-bg-muted/30 p-4">
                                    <Link
                                        href={`/dashboard/projects/${project.id}`}
                                        className="flex w-full items-center justify-center gap-2 text-sm font-medium text-text-muted hover:text-primary transition-colors"
                                    >
                                        View Board <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </CardFooter>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
