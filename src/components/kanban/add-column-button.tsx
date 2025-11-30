'use client'

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { createColumn } from "@/lib/column-actions"
import { useTransition, useState } from "react"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function AddColumnButton({ projectId }: { projectId: string }) {
    const [isPending, startTransition] = useTransition()
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState("")
    const router = useRouter()

    const handleAddColumn = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!title.trim()) return

        startTransition(async () => {
            await createColumn(projectId, title)
            setTitle("")
            setOpen(false)
            router.refresh()
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-text-muted hover:text-text-primary"
                    title="Add Column"
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] bg-bg-surface border-border-subtle">
                <DialogHeader>
                    <DialogTitle>Add Column</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddColumn} className="space-y-4">
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
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending || !title.trim()}
                            className="bg-accent text-accent-foreground hover:bg-accent/90"
                        >
                            {isPending ? 'Creating...' : 'Create Column'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
