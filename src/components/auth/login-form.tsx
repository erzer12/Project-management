'use client'

import { useFormStatus } from 'react-dom'
import { authenticate } from '@/lib/actions'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"

export default function LoginForm() {
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setErrorMessage(null)
        const formData = new FormData(event.currentTarget)
        const result = await authenticate(formData)
        if (result) {
            setErrorMessage(result)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4 rounded-xl bg-bg-surface p-6 border border-border-subtle shadow-sm">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="m@example.com"
                        required
                        className="bg-bg-app border-border-strong focus-visible:ring-accent"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="bg-bg-app border-border-strong focus-visible:ring-accent"
                    />
                </div>
                <LoginButton />
                <div
                    className="flex h-8 items-end space-x-1"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {errorMessage && (
                        <div className="flex items-center gap-2 text-sm text-danger">
                            <AlertCircle className="h-4 w-4" />
                            <p>{errorMessage}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="text-center text-sm text-text-muted">
                <p>Don&apos;t have an account? Contact your admin.</p>
            </div>
        </form>
    )
}

function LoginButton() {
    const { pending } = useFormStatus()

    return (
        <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={pending}>
            {pending ? 'Logging in...' : 'Log in'}
        </Button>
    )
}
