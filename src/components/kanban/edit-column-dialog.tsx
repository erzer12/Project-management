'use client'

import { Button } from "@/components/ui/button"
import { updateColumn } from "@/lib/column-actions"
import { useTransition, useState } from "react"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Column } from "@prisma/client"

interface EditColumnDialogProps {
    column: Column
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditColumnDialog({ column, open, onOpenChange }: EditColumnDialogProps) {
    const [isPending, startTransition] = useTransition()
    const [title, setTitle] = useState(column.title)
    const router = useRouter()

    const handleUpdateColumn = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!title.trim()) return

        startTransition(async () => {
            await updateColumn(column.id, title)
            onOpenChange(false)
            router.refresh()
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] bg-bg-surface border-border-subtle">
                <DialogHeader>
                    <DialogTitle>Edit Column</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdateColumn} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Column title..."
                            className="bg-bg-app"
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending || !title.trim()}
                            className="bg-accent text-accent-foreground hover:bg-accent/90"
                        >
                            {isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
