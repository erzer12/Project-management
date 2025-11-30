'use client'

import { useState, useEffect } from 'react'
import { createComment, getComments } from '@/lib/comment-actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { MessageSquare, Reply } from 'lucide-react'
import { toast } from 'sonner'

type CommentWithAuthor = {
    id: string
    content: string
    createdAt: Date
    author: { name: string | null, image: string | null }
    replies: CommentWithAuthor[]
}

export function CommentsSection({ taskId }: { taskId: string }) {
    const [comments, setComments] = useState<CommentWithAuthor[]>([])
    const [newComment, setNewComment] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const fetchComments = async () => {
        const data = await getComments(taskId)
        setComments(data as any) // Type casting due to serialization
    }

    useEffect(() => {
        fetchComments()
    }, [taskId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim()) return

        setSubmitting(true)
        const res = await createComment(taskId, newComment)
        if (res.success) {
            setNewComment('')
            fetchComments()
            toast.success("Comment added")
        } else {
            toast.error("Failed to add comment")
        }
        setSubmitting(false)
    }

    return (
        <div className="space-y-4">
            <Label>Comments</Label>

            <form onSubmit={handleSubmit} className="space-y-2">
                <Textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px]"
                />
                <div className="flex justify-end">
                    <Button type="submit" size="sm" disabled={submitting || !newComment.trim()}>
                        Post Comment
                    </Button>
                </div>
            </form>

            <div className="space-y-4 mt-4">
                {comments.map(comment => (
                    <CommentItem key={comment.id} comment={comment} taskId={taskId} onReply={fetchComments} />
                ))}
            </div>
        </div>
    )
}

function CommentItem({ comment, taskId, onReply }: { comment: CommentWithAuthor, taskId: string, onReply: () => void }) {
    const [replying, setReplying] = useState(false)
    const [replyContent, setReplyContent] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!replyContent.trim()) return

        setSubmitting(true)
        const res = await createComment(taskId, replyContent, comment.id)
        if (res.success) {
            setReplyContent('')
            setReplying(false)
            onReply()
            toast.success("Reply added")
        } else {
            toast.error("Failed to add reply")
        }
        setSubmitting(false)
    }

    return (
        <div className="flex gap-3">
            <Avatar className="h-8 w-8">
                <AvatarImage src={comment.author.image || ''} />
                <AvatarFallback>{comment.author.name?.[0] || '?'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{comment.author.name}</span>
                    <span className="text-xs text-text-muted">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                </div>
                <p className="text-sm text-text-primary">{comment.content}</p>

                <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-text-muted hover:text-text-primary"
                    onClick={() => setReplying(!replying)}
                >
                    <Reply className="h-3 w-3 mr-1" />
                    Reply
                </Button>

                {replying && (
                    <form onSubmit={handleReply} className="mt-2 space-y-2">
                        <Textarea
                            placeholder="Write a reply..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="min-h-[60px] text-sm"
                        />
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="ghost" size="sm" onClick={() => setReplying(false)}>Cancel</Button>
                            <Button type="submit" size="sm" disabled={submitting || !replyContent.trim()}>Reply</Button>
                        </div>
                    </form>
                )}

                {comment.replies?.length > 0 && (
                    <div className="mt-2 space-y-3 pl-4 border-l-2 border-border-subtle">
                        {comment.replies.map(reply => (
                            <div key={reply.id} className="flex gap-3">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={reply.author.image || ''} />
                                    <AvatarFallback>{reply.author.name?.[0] || '?'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold">{reply.author.name}</span>
                                        <span className="text-xs text-text-muted">{formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}</span>
                                    </div>
                                    <p className="text-sm text-text-primary">{reply.content}</p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto p-0 text-text-muted hover:text-text-primary mt-1"
                                        onClick={() => setReplying(!replying)}
                                    >
                                        <Reply className="h-3 w-3 mr-1" />
                                        Reply
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
