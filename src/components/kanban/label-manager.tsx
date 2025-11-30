'use client'

import { useState, useTransition } from 'react'
import { Label as LabelType } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { createLabel } from '@/lib/task-actions'
import { Plus, Tag, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface LabelManagerProps {
    projectId: string
    labels: LabelType[]
    selectedLabelIds: string[]
    onLabelToggle: (labelId: string) => void
}

export function LabelManager({ projectId, labels, selectedLabelIds, onLabelToggle }: LabelManagerProps) {
    const [isPending, startTransition] = useTransition()
    const [newLabelName, setNewLabelName] = useState('')
    const [newLabelColor, setNewLabelColor] = useState('#3b82f6') // Default blue
    const [isOpen, setIsOpen] = useState(false)

    const handleCreateLabel = () => {
        if (!newLabelName.trim()) return

        startTransition(async () => {
            const res = await createLabel(projectId, newLabelName, newLabelColor)
            if (res?.success) {
                toast.success("Label created")
                setNewLabelName('')
                // Keep popover open to select the new label if desired, or just to show it exists
            } else {
                toast.error("Failed to create label")
            }
        })
    }

    const colors = [
        '#ef4444', // red
        '#f97316', // orange
        '#eab308', // yellow
        '#22c55e', // green
        '#3b82f6', // blue
        '#a855f7', // purple
        '#ec4899', // pink
        '#64748b', // slate
    ]

    return (
        <div className="space-y-2">
            <Label>Labels</Label>
            <div className="flex flex-wrap gap-2 mb-2">
                {selectedLabelIds.map(id => {
                    const label = labels.find(l => l.id === id)
                    if (!label) return null
                    return (
                        <Badge
                            key={label.id}
                            style={{ backgroundColor: label.color }}
                            className="text-white hover:opacity-90 cursor-pointer flex items-center gap-1"
                            onClick={() => onLabelToggle(label.id)}
                        >
                            {label.name}
                            <X className="h-3 w-3" />
                        </Badge>
                    )
                })}
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-6 text-xs rounded-full">
                            <Plus className="h-3 w-3 mr-1" />
                            Add Label
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3" align="start">
                        <div className="space-y-3">
                            <h4 className="font-medium text-sm">Select Label</h4>
                            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                {labels.map(label => {
                                    const isSelected = selectedLabelIds.includes(label.id)
                                    return (
                                        <div
                                            key={label.id}
                                            className={`cursor-pointer px-2 py-1 rounded text-xs text-white flex items-center gap-2 ${isSelected ? 'ring-2 ring-offset-1 ring-offset-bg-surface ring-primary' : ''}`}
                                            style={{ backgroundColor: label.color }}
                                            onClick={() => onLabelToggle(label.id)}
                                        >
                                            {label.name}
                                            {isSelected && <Tag className="h-3 w-3" />}
                                        </div>
                                    )
                                })}
                                {labels.length === 0 && <p className="text-xs text-text-muted">No labels created yet.</p>}
                            </div>

                            <div className="border-t pt-3 space-y-2">
                                <h4 className="font-medium text-sm">Create New</h4>
                                <Input
                                    placeholder="Label name"
                                    value={newLabelName}
                                    onChange={(e) => setNewLabelName(e.target.value)}
                                    className="h-8 text-xs"
                                />
                                <div className="flex gap-1 flex-wrap">
                                    {colors.map(color => (
                                        <div
                                            key={color}
                                            className={`w-5 h-5 rounded-full cursor-pointer ${newLabelColor === color ? 'ring-2 ring-offset-1 ring-offset-bg-surface ring-primary' : ''}`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setNewLabelColor(color)}
                                        />
                                    ))}
                                </div>
                                <Button
                                    size="sm"
                                    className="w-full h-8 text-xs"
                                    onClick={handleCreateLabel}
                                    disabled={isPending || !newLabelName.trim()}
                                >
                                    {isPending ? 'Creating...' : 'Create'}
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}
