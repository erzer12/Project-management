'use client'

import { useState, useTransition } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateProjectStatus } from '@/lib/project-actions'
import { ProjectStatus } from '@prisma/client'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ProjectStatusSelectProps {
    projectId: string
    initialStatus: ProjectStatus
    canEdit: boolean
}

export function ProjectStatusSelect({ projectId, initialStatus, canEdit }: ProjectStatusSelectProps) {
    const [status, setStatus] = useState<ProjectStatus>(initialStatus)
    const [isPending, startTransition] = useTransition()

    const handleValueChange = (value: ProjectStatus) => {
        setStatus(value)
        startTransition(async () => {
            await updateProjectStatus(projectId, value)
        })
    }

    const statusColors = {
        [ProjectStatus.ACTIVE]: 'bg-success/10 text-success border-success/20',
        [ProjectStatus.INACTIVE]: 'bg-text-muted/10 text-text-muted border-text-muted/20',
        [ProjectStatus.COMPLETED]: 'bg-accent/10 text-accent border-accent/20',
        [ProjectStatus.ARCHIVED]: 'bg-warning/10 text-warning border-warning/20',
    }

    if (!canEdit) {
        return (
            <Badge variant="outline" className={cn("capitalize", statusColors[status])}>
                {status.toLowerCase()}
            </Badge>
        )
    }

    return (
        <Select
            value={status}
            onValueChange={(val) => handleValueChange(val as ProjectStatus)}
            disabled={isPending}
        >
            <SelectTrigger className={cn("w-[140px] h-8 capitalize", statusColors[status])}>
                <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
                {Object.values(ProjectStatus).map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                        {s.toLowerCase()}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
