'use client'

import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Bell } from "lucide-react"
import { useEffect, useState } from "react"
import { getNotifications, markAsRead } from "@/lib/notification-actions"
import { Notification } from "@prisma/client"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"

export function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [open, setOpen] = useState(false)

    const fetchNotifications = async () => {
        const data = await getNotifications()
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.read).length)
    }

    useEffect(() => {
        fetchNotifications()
        // Poll every minute
        const interval = setInterval(fetchNotifications, 60000)
        return () => clearInterval(interval)
    }, [])

    const handleMarkAsRead = async (id: string) => {
        await markAsRead(id)
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full p-0 text-xs">
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b">
                    <h4 className="font-semibold">Notifications</h4>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length > 0 ? (
                        notifications.map(notification => (
                            <div
                                key={notification.id}
                                className={`p-4 border-b last:border-0 hover:bg-muted/50 transition-colors ${!notification.read ? 'bg-muted/20' : ''}`}
                                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                            >
                                <div className="flex justify-between items-start gap-2">
                                    <p className="text-sm">{notification.message}</p>
                                    {!notification.read && <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1" />}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formatDistanceToNow(notification.createdAt)} ago
                                </p>
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No notifications
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
