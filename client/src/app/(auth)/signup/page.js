'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import Link from 'next/link';
import { UserPlus, Eye, EyeOff, Building2 } from 'lucide-react';

export default function SignupPage() {
    const router = useRouter();
    const signup = useAuthStore((state) => state.signup);
    const orgAdminSignup = useAuthStore((state) => state.orgAdminSignup);
    const sendOtp = useAuthStore((state) => state.sendOtp);

    const [tab, setTab] = useState('user'); // 'user' or 'org'

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [organizationName, setOrganizationName] = useState('');
    
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // OTP State
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);
    const [sendingOtp, setSendingOtp] = useState(false);

    useEffect(() => {
        let interval;
        if (otpTimer > 0) {
            interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [otpTimer]);

    const handleSendOtp = async () => {
        if (!email) {
            setError('Please enter your email first.');
            return;
        }
        setError('');
        setSendingOtp(true);
        const { response, data } = await sendOtp(email);
        setSendingOtp(false);
        if (response.ok && data?.status) {
            setOtpSent(true);
            setOtpTimer(60);
        } else {
            setError(data?.message || 'Failed to send OTP');
        }
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        let response, data;

        if (tab === 'user') {
            const res = await signup(name, email, password, otp);
            response = res.response;
            data = res.data;
        } else {
            const res = await orgAdminSignup(name, email, password, phone, organizationName, otp);
            response = res.response;
            data = res.data;
        }

        setSubmitting(false);

        if (!response.ok || data?.status === false) {
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
                <CardHeader className="text-center space-y-2 pb-4">
                    <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                        {tab === 'user' ? <UserPlus className="w-6 h-6 text-primary" /> : <Building2 className="w-6 h-6 text-primary" />}
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
                    <CardDescription>Join Resvo to discover extraordinary venues</CardDescription>
                </CardHeader>

                <div className="flex border-b border-border/50 px-6">
                    <button
                        type="button"
                        className={`flex-1 pb-3 text-sm font-medium transition-colors ${tab === 'user' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setTab('user')}
                    >
                        User
                    </button>
                    <button
                        type="button"
                        className={`flex-1 pb-3 text-sm font-medium transition-colors ${tab === 'org' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setTab('org')}
                    >
                        Organization
                    </button>
                </div>

                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-foreground">Name</label>
                            <Input
                                type="text"
                                placeholder={tab === 'user' ? "John Doe" : "Jane Doe (Owner)"}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-foreground">Email</label>
                            <div className="flex gap-2">
                                <Input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={otpSent}
                                    className="flex-1"
                                />
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={handleSendOtp} 
                                    disabled={!email || sendingOtp || otpTimer > 0}
                                >
                                    {otpTimer > 0 ? `Wait ${otpTimer}s` : (sendingOtp ? 'Sending...' : 'Send OTP')}
                                </Button>
                            </div>
                        </div>

                        {otpSent && (
                            <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="text-sm font-medium text-foreground">Verification Code (OTP)</label>
                                <Input
                                    type="text"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    maxLength={6}
                                />
                            </div>
                        )}
                        
                        {tab === 'org' && (
                            <>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-foreground">Phone Number</label>
                                    <Input
                                        type="tel"
                                        placeholder="+1 234 567 8900"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-foreground">Organization Name</label>
                                    <Input
                                        type="text"
                                        placeholder="Acme Venues"
                                        value={organizationName}
                                        onChange={(e) => setOrganizationName(e.target.value)}
                                        required
                                    />
                                </div>
                            </>
                        )}

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-foreground">Password</label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Min 8 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
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