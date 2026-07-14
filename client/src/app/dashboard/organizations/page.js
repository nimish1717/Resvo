'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../../lib/authStore';

export default function OrgDashboardPage() {
    const authFetch = useAuthStore((state) => state.authFetch);
    const user = useAuthStore((state) => state.user);
    const loading = useAuthStore((state) => state.loading);

    const [organizations, setOrganizations] = useState([]);
    const [selectedHallId, setSelectedHallId] = useState('');
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState('');
    const [actionLoadingId, setActionLoadingId] = useState(null);

    // orgId -> array of pending join requests, loaded on demand per org
    const [joinRequests, setJoinRequests] = useState({});
    const [inviteCodes, setInviteCodes] = useState({}); // orgId -> { code, expiresAt }

    useEffect(() => {
        if (loading || !user) return;
        async function loadMyOrgs() {
            const { response, data } = await authFetch('/organizations/mine');
            if (response.ok) {
                setOrganizations(data.organizations || []);
            }
        }
        loadMyOrgs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, user]);

    async function loadBookings(hallId) {
        setError('');
        setSelectedHallId(hallId);
        const { response, data } = await authFetch(`/bookings/hall/${hallId}`);
        if (!response.ok) {
            setError(data?.message || data?.error || 'Could not load bookings');
            return;
        }
        setBookings(data.bookings || []);
    }

    async function handleDecision(bookingId, action) {
        setActionLoadingId(bookingId);
        const { response, data } = await authFetch(`/bookings/${bookingId}/${action}`, {
            method: 'POST',
        });
        setActionLoadingId(null);
        if (!response.ok) {
            setError(data?.message || data?.error || 'Action failed');
            return;
        }
        loadBookings(selectedHallId);
    }

    async function generateInviteCode(orgId) {
        const { response, data } = await authFetch(`/organizations/${orgId}/invite-code`, {
            method: 'POST',
        });
        if (!response.ok) {
            setError(data?.message || data?.error || 'Could not generate invite code');
            return;
        }
        setInviteCodes((prev) => ({
            ...prev,
            [orgId]: {
                code: data.organization.invite_code,
                expiresAt: data.organization.invite_code_expires_at,
            },
        }));
    }

    async function loadJoinRequests(orgId) {
        const { response, data } = await authFetch(`/organizations/${orgId}/join-requests`);
        if (!response.ok) {
            setError(data?.message || data?.error || 'Could not load join requests');
            return;
        }
        setJoinRequests((prev) => ({ ...prev, [orgId]: data.requests || [] }));
    }

    async function handleJoinRequestDecision(orgId, requestId, action) {
        const { response, data } = await authFetch(`/organizations/join-requests/${requestId}/${action}`, {
            method: 'POST',
        });
        if (!response.ok) {
            setError(data?.message || data?.error || 'Action failed');
            return;
        }
        // Refresh the list for that org after approving/rejecting
        loadJoinRequests(orgId);
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-10">
            {loading ? (
                <p>Loading...</p>
            ) : !user ? (
                <p className="text-red-600">Please log in to view your organizations.</p>
            ) : (
                <>
                    <h1 className="text-2xl font-semibold mb-6">Your organizations</h1>

                    {organizations.length === 0 ? (
                        <p className="text-gray-500 mb-6">
                            You don't administer any organizations yet.{' '}
                            <a href="/list-venue" className="underline">List a venue</a> to get started.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-4 mb-8">
                            {organizations.map((org) => (
                                <div key={org.id} className="border rounded p-4">
                                    <p className="font-medium">
                                        {org.name}{' '}
                                        <span className="text-xs font-mono text-gray-500">({org.status} &middot; {org.myRole})</span>
                                    </p>

                                    {/* Halls under this org */}
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {org.halls.length === 0 ? (
                                            <p className="text-sm text-gray-500">No halls yet under this org.</p>
                                        ) : (
                                            org.halls.map((hall) => (
                                                <button
                                                    key={hall.id}
                                                    onClick={() => loadBookings(hall.id)}
                                                    className={`text-sm border rounded px-3 py-1.5 ${selectedHallId === hall.id ? 'bg-black text-white' : ''
                                                        }`}
                                                >
                                                    {hall.name}
                                                </button>
                                            ))
                                        )}
                                    </div>

                                    {/* Co-Admin invite + join requests — only relevant for org_admin, not co_admin */}
                                    {org.myRole === 'org_admin' && (
                                        <div className="mt-4 pt-4 border-t text-sm">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => generateInviteCode(org.id)}
                                                    className="border rounded px-3 py-1.5"
                                                >
                                                    Generate invite code
                                                </button>
                                                {inviteCodes[org.id] && (
                                                    <span className="font-mono text-xs">
                                                        Code: <strong>{inviteCodes[org.id].code}</strong>{' '}
                                                        (expires {new Date(inviteCodes[org.id].expiresAt).toLocaleTimeString()})
                                                    </span>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => loadJoinRequests(org.id)}
                                                className="underline text-xs mt-3"
                                            >
                                                View pending join requests
                                            </button>

                                            {joinRequests[org.id] && (
                                                <div className="flex flex-col gap-2 mt-2">
                                                    {joinRequests[org.id].length === 0 ? (
                                                        <p className="text-gray-500 text-xs">No pending requests.</p>
                                                    ) : (
                                                        joinRequests[org.id].map((req) => (
                                                            <div key={req.id} className="flex justify-between items-center border rounded px-3 py-2">
                                                                <span>{req.users.name} ({req.users.email})</span>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => handleJoinRequestDecision(org.id, req.id, 'approve')}
                                                                        className="text-green-600 underline"
                                                                    >
                                                                        Approve
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleJoinRequestDecision(org.id, req.id, 'reject')}
                                                                        className="text-red-600 underline"
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

                    {selectedHallId && (
                        <>
                            <h2 className="font-semibold mb-3">Bookings</h2>
                            <div className="flex flex-col gap-3">
                                {bookings.map((booking) => (
                                    <div key={booking.id} className="border rounded p-4 flex justify-between items-center">
                                        <div className="text-sm">
                                            <p className="font-mono text-xs text-gray-500">{booking.id}</p>
                                            <p>Status: <span className="font-mono">{booking.status}</span></p>
                                        </div>
                                        {booking.status === 'requested' && (
                                            <div className="flex gap-2 text-sm">
                                                <button
                                                    onClick={() => handleDecision(booking.id, 'approve')}
                                                    disabled={actionLoadingId === booking.id}
                                                    className="bg-green-600 text-white px-3 py-1.5 rounded disabled:opacity-50"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleDecision(booking.id, 'reject')}
                                                    disabled={actionLoadingId === booking.id}
                                                    className="bg-red-600 text-white px-3 py-1.5 rounded disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}