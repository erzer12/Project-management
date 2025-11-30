'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { registerUser } from "@/lib/auth-actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

export function RegisterForm() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    })

    const onSubmit = async (data: z.infer<typeof registerSchema>) => {
        setLoading(true)
        const res = await registerUser(data)
        if (res?.success) {
            toast.success("Account created! Please wait for admin verification.")
            router.push("/login")
        } else {
            toast.error(res?.error || "Failed to create account")
        }
        setLoading(false)
    }

    return (
        <div className="grid gap-6">
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            placeholder="John Doe"
                            type="text"
                            autoCapitalize="none"
                            autoCorrect="off"
                            disabled={loading}
                            {...form.register("name")}
                            className="bg-bg-surface"
                        />
                        {form.formState.errors.name && (
                            <p className="text-xs text-danger">{form.formState.errors.name.message}</p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            placeholder="name@example.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={loading}
                            {...form.register("email")}
                            className="bg-bg-surface"
                        />
                        {form.formState.errors.email && (
                            <p className="text-xs text-danger">{form.formState.errors.email.message}</p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            disabled={loading}
                            {...form.register("password")}
                            className="bg-bg-surface"
                        />
                        {form.formState.errors.password && (
                            <p className="text-xs text-danger">{form.formState.errors.password.message}</p>
                        )}
                    </div>
                    <Button disabled={loading} className="bg-accent text-accent-foreground hover:bg-accent/90">
                        {loading ? "Creating account..." : "Create Account"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
