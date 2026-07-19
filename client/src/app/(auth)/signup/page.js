'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';

export default function SignupPage() {
    const router = useRouter();
    const signup = useAuthStore((state) => state.signup);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        const { response, data } = await signup(name, email, password);

        setSubmitting(false);

        if (!response.ok) {
            setError(data?.message || data?.error || 'Something went wrong');
            return;
        }

        switch (data.user.role) {
            case "SUPER_ADMIN":
                router.push("/admin/dashboard");
                break;
            case "ORG_ADMIN":
                router.push("/organization/dashboard");
                break;
            default:
                router.push("/dashboard");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30 relative">
            <Link href="/" className="absolute top-8 left-8 sm:left-12 text-3xl font-serif font-bold tracking-tight text-[#E2C391] z-50">
                Resvo
            </Link>
            <Card className="w-full max-w-md shadow-xl border-border/50">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                        <UserPlus className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
                    <CardDescription>Join Resvo to discover extraordinary venues</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-foreground">Name</label>
                            <Input
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-foreground">Email</label>
                            <Input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-foreground">Password</label>
                            <Input
                                type="password"
                                placeholder="Min 8 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                            />
                        </div>

                        {error && <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 border border-red-200 dark:border-red-900/50 rounded-md text-sm">{error}</div>}

                        <Button
                            type="submit"
                            disabled={submitting}
                            className="w-full mt-2"
                        >
                            {submitting ? 'Creating account...' : 'Sign up'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center border-t border-border/50 pt-6">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className="font-semibold text-primary hover:underline">
                            Log in
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}