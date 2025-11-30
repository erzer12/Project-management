'use client'

import { MobileSidebar } from "./app-sidebar"
import { Notifications } from "@/components/dashboard/notifications"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { UserNav } from "./user-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { User } from "next-auth"

export function AppNavbar({ user }: { user: User }) {
    return (
        <header className="flex h-12 items-center gap-4 border-b border-border-subtle bg-bg-surface px-4 lg:h-[48px] lg:px-6">
            <MobileSidebar />
            <div className="w-full flex-1">
                <form>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-muted" />
                        <Input
                            type="search"
                            placeholder="Search..."
                            className="w-full appearance-none bg-bg-app pl-8 shadow-none md:w-2/3 lg:w-1/3 border-border-subtle focus-visible:ring-accent h-9"
                        />
                    </div>
                </form>
            </div>
            <div className="flex items-center gap-2">
                <ModeToggle />
                <Notifications />
                <UserNav user={user} />
            </div>
        </header>
    )
}
