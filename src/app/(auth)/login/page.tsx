import LoginForm from '@/components/auth/login-form';
import { Layers } from 'lucide-react';

export default function LoginPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-bg-app p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                        <Layers className="h-6 w-6" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-text-primary">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-sm text-text-muted">
                        Sign in to your account to continue
                    </p>
                </div>
                <LoginForm />
                <p className="text-center text-sm text-text-muted">
                    Don&apos;t have an account?{" "}
                    <a href="/register" className="font-semibold text-text-primary hover:underline">
                        Sign up
                    </a>
                </p>
            </div>
        </main>
    );
}
