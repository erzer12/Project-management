import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { ProfileForm } from "./profile-form"

export default async function ProfilePage() {
    const session = await auth()
    if (!session?.user) redirect('/login')

    return (
        <div className="container mx-auto py-10 max-w-2xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text-primary">Profile Settings</h1>
                <p className="text-text-muted">Manage your account settings.</p>
            </div>
            <div className="rounded-xl border border-border-subtle bg-bg-surface shadow-sm p-6">
                <ProfileForm user={session.user} />
            </div>
        </div>
    )
}
