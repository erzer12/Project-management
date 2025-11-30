import { AppSidebar } from "@/components/layout/app-sidebar"
import { AppNavbar } from "@/components/layout/app-navbar"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await auth()
    if (!session?.user) redirect('/login')

    return (
        <div className="grid h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] overflow-hidden">
            <div className="hidden md:block h-full overflow-hidden border-r border-border-subtle bg-bg-surface">
                <AppSidebar role={session.user.role} />
            </div>
            <div className="flex flex-col h-full overflow-hidden">
                <AppNavbar user={session.user} />
                <main className="flex-1 overflow-y-auto bg-bg-app p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
