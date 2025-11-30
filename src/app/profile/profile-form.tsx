'use client'

import { User } from "next-auth"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateProfile, changePassword, uploadAvatar } from "@/lib/user-actions"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Camera } from "lucide-react"

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    bio: z.string().optional(),
    jobTitle: z.string().optional(),
})

const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export function ProfileForm({ user }: { user: User & { bio?: string | null, jobTitle?: string | null } }) {
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user.name || "",
            bio: user.bio || "",
            jobTitle: user.jobTitle || "",
        },
    })

    const passwordForm = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
    })

    const onProfileSubmit = async (data: z.infer<typeof profileSchema>) => {
        setLoading(true)
        const res = await updateProfile(data)
        if (res?.success) {
            router.refresh()
            toast.success("Profile updated")
        } else {
            toast.error("Failed to update profile")
        }
        setLoading(false)
    }

    const onPasswordSubmit = async (data: z.infer<typeof passwordSchema>) => {
        setLoading(true)
        const res = await changePassword(data.currentPassword, data.newPassword)
        if (res?.success) {
            toast.success("Password changed successfully")
            passwordForm.reset()
        } else {
            toast.error(res?.error || "Failed to change password")
        }
        setLoading(false)
    }

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append("file", file)

        const res = await uploadAvatar(formData)
        if (res.success) {
            router.refresh()
            toast.success("Avatar updated")
        } else {
            toast.error("Failed to upload avatar")
        }
        setUploading(false)
    }

    return (
        <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
                <div className="space-y-8">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={user.image || ''} />
                                <AvatarFallback className="text-2xl bg-accent text-accent-foreground">
                                    {user.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div
                                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Camera className="h-8 w-8 text-white" />
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                disabled={uploading}
                            />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium">Profile Picture</h3>
                            <p className="text-sm text-text-muted">Click to upload a new avatar.</p>
                        </div>
                    </div>

                    <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Display Name</Label>
                                <Input id="name" {...form.register("name")} className="bg-bg-app" />
                                {form.formState.errors.name && (
                                    <p className="text-xs text-danger">{form.formState.errors.name.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="jobTitle">Job Title</Label>
                                <Input id="jobTitle" {...form.register("jobTitle")} className="bg-bg-app" placeholder="e.g. Senior Developer" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea id="bio" {...form.register("bio")} className="bg-bg-app min-h-[100px]" placeholder="Tell us a bit about yourself" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" value={user.email || ''} disabled className="bg-bg-muted text-text-muted" />
                            <p className="text-xs text-text-muted">Email cannot be changed.</p>
                        </div>

                        <Button type="submit" disabled={loading || !form.formState.isDirty} className="bg-accent text-accent-foreground hover:bg-accent/90">
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </form>
                </div>
            </TabsContent>

            <TabsContent value="security">
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6 max-w-md">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input id="currentPassword" type="password" {...passwordForm.register("currentPassword")} className="bg-bg-app" />
                        {passwordForm.formState.errors.currentPassword && (
                            <p className="text-xs text-danger">{passwordForm.formState.errors.currentPassword.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" {...passwordForm.register("newPassword")} className="bg-bg-app" />
                        {passwordForm.formState.errors.newPassword && (
                            <p className="text-xs text-danger">{passwordForm.formState.errors.newPassword.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input id="confirmPassword" type="password" {...passwordForm.register("confirmPassword")} className="bg-bg-app" />
                        {passwordForm.formState.errors.confirmPassword && (
                            <p className="text-xs text-danger">{passwordForm.formState.errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <Button type="submit" disabled={loading} className="bg-accent text-accent-foreground hover:bg-accent/90">
                        {loading ? "Updating Password..." : "Update Password"}
                    </Button>
                </form>
            </TabsContent>
        </Tabs>
    )
}
