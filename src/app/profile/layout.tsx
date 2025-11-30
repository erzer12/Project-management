import { AppSidebar } from "@/components/layout/app-sidebar"
import { AppNavbar } from "@/components/layout/app-navbar"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
    const session = await auth()
    if (!session?.user) redirect('/login')

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r border-border-subtle bg-bg-surface md:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <AppSidebar role={session.user.role} />
                </div>
            </div>
            <div className="flex flex-col">
                <AppNavbar user={session.user} />
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-bg-app">
                    {children}
                </main>
            </div>
        </div>
    )
}
