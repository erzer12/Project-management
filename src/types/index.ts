import { Task, User, Label } from "@prisma/client"

export type TaskWithDetails = Task & {
    assignee: User | null
    comments: any[]
    attachments: any[]
    labels: Label[]
}
