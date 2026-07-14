'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../../lib/authStore';

export default function AdminDashboardPage() {
    const user = useAuthStore((state) => state.user);
    const loading = useAuthStore((state) => state.loading);
    const authFetch = useAuthStore((state) => state.authFetch);

    const [organizations, setOrganizations] = useState([]);
    const [pageError, setPageError] = useState('');
    const [actionLoadingId, setActionLoadingId] = useState(null);

    async function loadPending() {
        const { response, data } = await authFetch('/organizations/pending');
        if (!response.ok) {
            setPageError(data?.message || data?.error || 'Could not load pending organizations');
            return;
        }
        setOrganizations(data.organizations || []);
    }

    useEffect(() => {
        if (!loading && user?.isSuperAdmin) {
            loadPending();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, user]);

    async function handleDecision(orgId, action) {
        setActionLoadingId(orgId);
        const { response, data } = await authFetch(`/organizations/${orgId}/${action}`, {
            method: 'POST',
        });
        setActionLoadingId(null);

        if (!response.ok) {
            setPageError(data?.message || data?.error || 'Action failed');
            return;
        }
        // Remove it from the pending list immediately rather than
        // waiting for a full reload.
        setOrganizations((prev) => prev.filter((org) => org.id !== orgId));
    }

    if (loading) return <p className="p-8">Loading...</p>;

    if (!user?.isSuperAdmin) {
        return <p className="p-8 text-red-600">Super Admin access required.</p>;
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-10">
            <h1 className="text-2xl font-semibold mb-6">Pending organizations</h1>

            {pageError && <p className="text-red-600 text-sm mb-4">{pageError}</p>}

            {organizations.length === 0 ? (
                <p className="text-gray-500">Nothing pending review right now.</p>
            ) : (
                <div className="flex flex-col gap-3">
                    {organizations.map((org) => (
                        <div key={org.id} className="border rounded p-4 flex justify-between items-center">
                            <div>
                                <p className="font-medium">{org.name}</p>
                                <p className="text-xs text-gray-500 font-mono">{org.id}</p>
                            </div>
                            <div className="flex gap-2 text-sm">
                                <button
                                    onClick={() => handleDecision(org.id, 'approve')}
                                    disabled={actionLoadingId === org.id}
                                    className="bg-green-600 text-white px-3 py-1.5 rounded disabled:opacity-50"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleDecision(org.id, 'request-changes')}
                                    disabled={actionLoadingId === org.id}
                                    className="bg-yellow-500 text-white px-3 py-1.5 rounded disabled:opacity-50"
                                >
                                    Request changes
                                </button>
                                <button
                                    onClick={() => handleDecision(org.id, 'reject')}
                                    disabled={actionLoadingId === org.id}
                                    className="bg-red-600 text-white px-3 py-1.5 rounded disabled:opacity-50"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}