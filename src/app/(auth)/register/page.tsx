import { RegisterForm } from "./register-form"
import Link from "next/link"

export default function RegisterPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-bg-app">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
                    <p className="text-sm text-text-muted">
                        Enter your email below to create your account
                    </p>
                </div>
                <RegisterForm />
                <p className="px-8 text-center text-sm text-text-muted">
                    <Link href="/login" className="hover:text-text-primary underline underline-offset-4">
                        Already have an account? Sign In
                    </Link>
                </p>
            </div>
        </div>
    )
}
