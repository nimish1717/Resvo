'use client';

import { useState } from 'react';
import { useAuthStore } from '../lib/authStore';

export default function JoinOrganizationPage() {
    const authFetch = useAuthStore((state) => state.authFetch);
    const user = useAuthStore((state) => state.user);

    const [inviteCode, setInviteCode] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        const { response, data } = await authFetch('/organizations/join', {
            method: 'POST',
            body: JSON.stringify({ inviteCode }),
        });

        setSubmitting(false);

        if (!response.ok) {
            // Covers the 409 "already have a pending request" and 400
            // "already a member / invalid or expired code" cases.
            setError(data?.message || data?.error || 'Something went wrong');
            return;
        }
        setResult(data.request);
    }

    if (!user) {
        return <p className="p-8 text-red-600">Please log in to join an organization.</p>;
    }

    return (
        <div className="max-w-sm mx-auto px-4 py-10">
            <h1 className="text-2xl font-semibold mb-4">Join an organization</h1>
            <p className="text-sm text-gray-600 mb-6">
                Enter the invite code an Organization Admin shared with you. Your request will need
                their approval before you become a Co-Admin.
            </p>

            {result ? (
                <div className="border rounded p-4 bg-yellow-50">
                    <p className="font-medium">Join request submitted</p>
                    <p className="text-sm text-gray-600 mt-1">
                        Status: <span className="font-mono">{result.status}</span> — waiting on the
                        Organization Admin's approval.
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                        type="text"
                        placeholder="Invite code"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                        required
                        className="border rounded px-3 py-2 font-mono"
                    />
                    {error && <p className="text-red-600 text-sm">{error}</p>}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-black text-white rounded px-3 py-2 disabled:opacity-50"
                    >
                        {submitting ? 'Submitting...' : 'Submit request'}
                    </button>
                </form>
            )}
        </div>
    );
}