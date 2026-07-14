'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/authStore';

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
            // Surfaces backend messages directly — e.g. the 409 "email
            // already exists" or 400 "password too short" you already
            // built and tested on the API.
            setError(data?.message || data?.error || 'Something went wrong');
            return;
        }

        router.push('/');
    }

    return (
        <div className="max-w-sm mx-auto mt-16 px-4">
            <h1 className="text-2xl font-semibold mb-6">Create an account</h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="border rounded px-3 py-2"
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border rounded px-3 py-2"
                />
                <input
                    type="password"
                    placeholder="Password (min 8 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="border rounded px-3 py-2"
                />

                {error && <p className="text-red-600 text-sm">{error}</p>}

                <button
                    type="submit"
                    disabled={submitting}
                    className="bg-black text-white rounded px-3 py-2 disabled:opacity-50"
                >
                    {submitting ? 'Creating account...' : 'Sign up'}
                </button>
            </form>
        </div>
    );
}