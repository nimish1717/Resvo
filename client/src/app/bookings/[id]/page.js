'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '../../lib/authStore';

export default function BookingDetailPage() {
    const { id } = useParams();
    const authFetch = useAuthStore((state) => state.authFetch);

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [suggestions, setSuggestions] = useState(null);
    const [suggestionsError, setSuggestionsError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    async function loadBooking() {
        const { response, data } = await authFetch(`/bookings/${id}`);
        if (!response.ok) {
            setError(data?.message || data?.error || 'Booking not found');
        } else {
            setBooking(data.booking);
        }
        setLoading(false);
    }

    useEffect(() => {
        loadBooking();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    async function loadSuggestions() {
        setSuggestionsError('');
        const { response, data } = await authFetch(`/bookings/${id}/suggestions`);
        if (!response.ok) {
            setSuggestionsError(data?.message || data?.error || 'Could not load suggestions');
            return;
        }
        setSuggestions(data.suggestions || data);
    }

    async function acceptSuggestion(suggestion) {
        setActionLoading(true);
        const { response, data } = await authFetch(`/bookings/${id}/accept-suggestion`, {
            method: 'POST',
            body: JSON.stringify({
                hallId: suggestion.hall_id,
                startTime: suggestion.start_time,
                endTime: suggestion.end_time,
            }),
        });
        setActionLoading(false);

        if (!response.ok) {
            setSuggestionsError(data?.message || data?.error || 'Could not accept that suggestion');
            return;
        }
        // A new booking now exists in its place — reload this page's
        // booking to reflect the 'rejected' + superseded_by state.
        loadBooking();
        setSuggestions(null);
    }

    async function declineSuggestions() {
        setActionLoading(true);
        await authFetch(`/bookings/${id}/decline-suggestions`, { method: 'POST' });
        setActionLoading(false);
        loadBooking();
        setSuggestions(null);
    }

    if (loading) return <p className="p-8">Loading...</p>;
    if (error) return <p className="p-8 text-red-600">{error}</p>;
    if (!booking) return null;

    return (
        <div className="max-w-xl mx-auto px-4 py-10">
            <h1 className="text-2xl font-semibold mb-4">Booking status</h1>

            <div className="border rounded p-4">
                <p className="font-mono text-sm text-gray-500">ID: {booking.id}</p>
                <p className="mt-2">
                    Status: <span className="font-mono font-semibold">{booking.status}</span>
                </p>
                {booking.reason && (
                    <p className="text-sm text-gray-500 mt-1">Reason: {booking.reason}</p>
                )}
                {booking.superseded_by && (
                    <p className="text-sm text-gray-500 mt-1">
                        Superseded by booking:{' '}
                        <span className="font-mono">{booking.superseded_by}</span>
                    </p>
                )}
            </div>

            {booking.status === 'conflicted' && (
                <div className="mt-6">
                    {!suggestions ? (
                        <button
                            onClick={loadSuggestions}
                            className="bg-black text-white rounded px-3 py-2 text-sm"
                        >
                            See available alternatives
                        </button>
                    ) : suggestionsError ? (
                        <p className="text-red-600 text-sm">{suggestionsError}</p>
                    ) : (
                        <div>
                            <h2 className="font-semibold mb-3">Suggested alternatives</h2>
                            <div className="flex flex-col gap-2">
                                {suggestions.map((s, i) => (
                                    <div key={i} className="border rounded p-3 flex justify-between items-center">
                                        <div className="text-sm">
                                            <p className="font-mono text-xs text-gray-500">
                                                Hall: {s.hall_id.slice(0, 8)}...
                                            </p>
                                            <p className="font-mono text-gray-700">
                                                {new Date(s.start_time).toLocaleString()} — {new Date(s.end_time).toLocaleString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => acceptSuggestion(s)}
                                            disabled={actionLoading}
                                            className="text-sm underline disabled:opacity-50"
                                        >
                                            Accept
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={declineSuggestions}
                                disabled={actionLoading}
                                className="mt-4 text-sm text-red-600 underline disabled:opacity-50"
                            >
                                None of these work — decline
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}