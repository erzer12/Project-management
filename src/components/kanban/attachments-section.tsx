'use client'

import { useState, useEffect } from 'react'
import { Attachment } from '@prisma/client'
import { uploadFile, deleteAttachment, getAttachments } from '@/lib/upload-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileIcon, Trash2, UploadCloud } from 'lucide-react'
import { toast } from 'sonner'

export function AttachmentsSection({ taskId }: { taskId: string }) {
    const [attachments, setAttachments] = useState<Attachment[]>([])
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        getAttachments(taskId).then(setAttachments)
    }, [taskId])

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return

        setUploading(true)
        const formData = new FormData()
        formData.append('file', e.target.files[0])
        formData.append('taskId', taskId)

        const res = await uploadFile(formData)
        if (res.success) {
            const newAttachments = await getAttachments(taskId)
            setAttachments(newAttachments)
            toast.success("File uploaded")
        } else {
            toast.error("Upload failed")
        }
        setUploading(false)
        // Reset input
        e.target.value = ''
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this attachment?")) return

        const res = await deleteAttachment(id)
        if (res.success) {
            setAttachments(prev => prev.filter(a => a.id !== id))
            toast.success("Attachment deleted")
        } else {
            toast.error("Delete failed")
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label>Attachments</Label>
                <div className="relative">
                    <Input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleUpload}
                        disabled={uploading}
                    />
                    <Button type="button" variant="outline" size="sm" disabled={uploading}>
                        <UploadCloud className="mr-2 h-4 w-4" />
                        {uploading ? 'Uploading...' : 'Upload File'}
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                {attachments.length === 0 && (
                    <p className="text-sm text-text-muted italic">No attachments yet.</p>
                )}
                {attachments.map(file => (
                    <div key={file.id} className="flex items-center justify-between p-2 border rounded-md bg-bg-muted/50">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <FileIcon className="h-4 w-4 flex-shrink-0 text-accent" />
                            <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm hover:underline truncate"
                            >
                                {file.filename}
                            </a>
                            <span className="text-xs text-text-muted">
                                ({Math.round((file.size || 0) / 1024)} KB)
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-text-muted hover:text-danger"
                            onClick={() => handleDelete(file.id)}
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    )
}
