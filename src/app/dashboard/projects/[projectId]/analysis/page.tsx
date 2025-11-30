import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Calendar, CheckCircle2, Clock, FileText, MessageSquare, Users } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default async function AnalysisPage({ params }: { params: Promise<{ projectId: string }> }) {
    const session = await auth()
    if (!session?.user) redirect('/login')

    const { projectId } = await params
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            manager: true,
            members: true,
            tasks: {
                include: {
                    assignee: true,
                    comments: true,
                    attachments: true
                }
            },
            labels: true
        }
    })

    if (!project) return <div>Project not found</div>

    // Stats
    const totalTasks = project.tasks.length
    const completedTasks = project.tasks.filter(t => t.status === 'DONE').length
    const inProgressTasks = project.tasks.filter(t => t.status === 'IN_PROGRESS').length
    const overdueTasks = project.tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE').length

    // Recent Activity (simplified: just recent comments for now)
    const recentComments = await prisma.comment.findMany({
        where: { task: { projectId } },
        include: { author: true, task: true },
        orderBy: { createdAt: 'desc' },
        take: 5
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">{project.title}</h1>
                        <p className="text-text-muted">Project Analysis & Overview</p>
                    </div>
                </div>
                <Link href={`/dashboard/projects/${projectId}`}>
                    <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                        View Kanban Board
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard title="Total Tasks" value={totalTasks} icon={FileText} />
                <StatsCard title="Completed" value={completedTasks} icon={CheckCircle2} />
                <StatsCard title="In Progress" value={inProgressTasks} icon={Clock} />
                <StatsCard title="Overdue" value={overdueTasks} icon={Calendar} className="text-red-500" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-border-subtle bg-bg-surface">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Team Members
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={project.manager.image || ""} />
                                    <AvatarFallback>{project.manager.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-text-primary">{project.manager.name}</p>
                                    <p className="text-xs text-text-muted">Project Manager</p>
                                </div>
                            </div>
                            {project.members.map(member => (
                                <div key={member.id} className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={member.image || ""} />
                                        <AvatarFallback>{member.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-text-primary">{member.name}</p>
                                        <p className="text-xs text-text-muted">Member</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border-subtle bg-bg-surface">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentComments.map(comment => (
                                <div key={comment.id} className="flex gap-3 items-start">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={comment.author.image || ""} />
                                        <AvatarFallback>{comment.author.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm text-text-primary">
                                            <span className="font-medium">{comment.author.name}</span> commented on <span className="font-medium">{comment.task.title}</span>
                                        </p>
                                        <p className="text-sm text-text-muted line-clamp-2">{comment.content}</p>
                                        <p className="text-xs text-text-muted">{formatDistanceToNow(comment.createdAt)} ago</p>
                                    </div>
                                </div>
                            ))}
                            {recentComments.length === 0 && (
                                <p className="text-text-muted text-sm">No recent activity.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function StatsCard({ title, value, icon: Icon, className }: { title: string, value: number, icon: any, className?: string }) {
    return (
        <Card className="border-border-subtle bg-bg-surface shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-text-muted">{title}</CardTitle>
                <Icon className={`h-4 w-4 text-text-muted ${className}`} />
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold text-text-primary ${className}`}>{value}</div>
            </CardContent>
        </Card>
    )
}
