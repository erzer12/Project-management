import Link from "next/link"
import { signOut } from "@/auth"
import { Button } from "@/components/ui/button"
import {
    Home,
    LayoutDashboard,
    LogOut
} from "lucide-react"
import { Notifications } from "./notifications"

export default function Sidebar() {
    return (
        <div className="flex h-full flex-col px-3 py-4 md:px-2">
            <Link
                className="mb-2 flex h-20 items-end justify-start rounded-md bg-blue-600 p-4 md:h-40"
                href="/"
            >
                <div className="w-32 text-white md:w-40">
                    <span className="text-xl font-bold">PM App</span>
                </div>
            </Link>
            <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
                <NavLinks />
                <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
                <div className="mt-auto p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Notifications />
                        <span className="text-sm font-medium">Notifications</span>
                    </div>
                    <form
                        action={async () => {
                            'use server';
                            await signOut();
                        }}
                    >
                        <Button
                            variant="ghost"
                            className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3"
                        >
                            <LogOut className="w-6" />
                            <div className="hidden md:block">Sign Out</div>
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}

function NavLinks() {
    const links = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Projects', href: '/dashboard/projects', icon: Home },
    ]

    return (
        <>
            {links.map((link) => {
                const LinkIcon = link.icon
                return (
                    <Link
                        key={link.name}
                        href={link.href}
                        className="flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3"
                    >
                        <LinkIcon className="w-6" />
                        <p className="hidden md:block">{link.name}</p>
                    </Link>
                )
            })}
        </>
    )
}
