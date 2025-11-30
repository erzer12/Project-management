'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    LayoutDashboard,
    FolderKanban,
    Settings,
    Users,
    Menu,
    LogOut,
    Moon,
    Sun
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { useTheme } from "next-themes"
import { signOut } from "next-auth/react"
import { Role } from "@prisma/client"

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
    // { name: 'Team', href: '/dashboard/team', icon: Users },
    // { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

interface AppSidebarProps {
    role?: Role
}

export function AppSidebar({ role }: AppSidebarProps) {
    const pathname = usePathname()
    const { setTheme, theme } = useTheme()

    const items = [
        ...navItems,
        ...(role === Role.ADMIN ? [{ name: 'Users', href: '/dashboard/admin/users', icon: Users }] : [])
    ]

    return (
        <div className="flex h-full flex-col border-r border-border-subtle bg-bg-surface">
            <div className="flex h-12 items-center border-b border-border-subtle px-4 lg:h-[48px] lg:px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <span className="text-lg font-bold text-text-primary tracking-tight">Project Management App</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
                    {items.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2.5 transition-all hover:text-text-primary",
                                pathname === item.href
                                    ? "bg-accent/10 text-accent font-semibold"
                                    : "text-text-muted hover:bg-bg-muted"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="mt-auto p-4 border-t border-border-subtle">
                <div className="flex items-center justify-between mb-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="text-text-muted hover:text-text-primary"
                    >
                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => signOut()}
                        className="text-text-muted hover:text-danger"
                    >
                        <LogOut className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export function MobileSidebar() {
    const [open, setOpen] = useState(false)
    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 md:hidden"
                >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 w-64">
                <AppSidebar />
            </SheetContent>
        </Sheet>
    )
}
