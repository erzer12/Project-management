import { auth } from "@/auth"
import { getProjects, getDashboardStats } from "@/lib/project-actions"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProjectList } from "@/components/projects/project-list"
import { Activity, CheckCircle2, Folder, Layers } from "lucide-react"

export default async function Page() {
    const session = await auth()
    if (!session?.user) {
        redirect('/login')
    }

    const [projects, stats] = await Promise.all([
        getProjects(),
        getDashboardStats()
    ])

    const { totalProjects, activeProjects, totalTasks, completedTasks } = stats

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-text-primary">Dashboard</h1>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard title="Total Projects" value={totalProjects} icon={Folder} />
                <StatsCard title="Active Projects" value={activeProjects} icon={Layers} />
                <StatsCard title="Total Tasks" value={totalTasks} icon={Activity} />
                <StatsCard title="Completed Tasks" value={completedTasks} icon={CheckCircle2} />
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-text-primary">Recent Projects</h2>
                <ProjectList projects={projects.slice(0, 3)} showSearch={false} />
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-text-primary">All Projects</h2>
                <ProjectList projects={projects} showSearch={true} />
            </div>
        </div>
    )
}

function StatsCard({ title, value, icon: Icon }: { title: string, value: number, icon: any }) {
    return (
        <Card className="border-border-subtle bg-bg-surface shadow-none hover:border-border-strong transition-all duration-150">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-text-muted">{title}</CardTitle>
                <Icon className="h-4 w-4 text-text-muted" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-text-primary">{value}</div>
            </CardContent>
        </Card>
    )
}
