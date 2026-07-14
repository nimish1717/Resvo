'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '../../lib/api';
import { useAuthStore } from '../../lib/authStore';

export default function HallDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const authFetch = useAuthStore((state) => state.authFetch);

    const [hall, setHall] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [bookingResult, setBookingResult] = useState(null);
    const [bookingError, setBookingError] = useState('');

    useEffect(() => {
        async function loadHall() {
            const { response, data } = await apiFetch(`/halls/${id}`);
            if (!response.ok) {
                setError(data?.message || data?.error || 'Hall not found');
            } else {
                setHall(data.hall);
            }
            setLoading(false);
        }
        loadHall();
    }, [id]);

    async function handleBookingSubmit(e) {
        e.preventDefault();
        setBookingError('');
        setBookingResult(null);

        if (!user) {
            setBookingError('Please log in to request a booking');
            return;
        }

        setSubmitting(true);

        // Combine the date + time inputs into full ISO datetime strings,
        // matching what POST /bookings expects.
        const startDateTime = new Date(`${date}T${startTime}:00`).toISOString();
        const endDateTime = new Date(`${date}T${endTime}:00`).toISOString();

        const { response, data } = await authFetch('/bookings', {
            method: 'POST',
            body: JSON.stringify({
                hallId: id,
                startTime: startDateTime,
                endTime: endDateTime,
            }),
        });

        setSubmitting(false);

        if (!response.ok) {
            setBookingError(data?.message || data?.error || 'Something went wrong');
            return;
        }

        setBookingResult(data.booking);
    }

    if (loading) return <p className="p-8">Loading...</p>;
    if (error) return <p className="p-8 text-red-600">{error}</p>;
    if (!hall) return null;

    return (
        <div className="max-w-2xl mx-auto px-4 py-10">
            <h1 className="text-2xl font-semibold">{hall.name}</h1>
            <p className="text-gray-500 mt-1">
                {hall.location_area} &middot; {hall.capacity} guests &middot; {hall.venue_tier}
            </p>
            <p className="mt-2 font-mono text-lg">
                ₹{Number(hall.price_per_slot).toLocaleString('en-IN')} / slot
            </p>

            <hr className="my-6" />

            <h2 className="text-lg font-semibold mb-4">Request a booking</h2>

            {bookingResult ? (
                <div className="border rounded p-4 bg-green-50">
                    <p className="font-medium">Booking requested successfully</p>
                    <p className="text-sm text-gray-600 mt-1">
                        Status: <span className="font-mono">{bookingResult.status}</span> — the hall's
                        admin will review your request.
                    </p>
                    <button
                        onClick={() => router.push(`/bookings/${bookingResult.id}`)}
                        className="mt-3 text-sm underline"
                    >
                        View booking status
                    </button>
                </div>
            ) : (
                <form onSubmit={handleBookingSubmit} className="flex flex-col gap-3 max-w-xs">
                    <label className="text-sm">
                        Date
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                            className="border rounded px-3 py-2 w-full mt-1"
                        />
                    </label>
                    <label className="text-sm">
                        Start time
                        <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            required
                            className="border rounded px-3 py-2 w-full mt-1"
                        />
                    </label>
                    <label className="text-sm">
                        End time
                        <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            required
                            className="border rounded px-3 py-2 w-full mt-1"
                        />
                    </label>

                    {bookingError && <p className="text-red-600 text-sm">{bookingError}</p>}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-black text-white rounded px-3 py-2 disabled:opacity-50"
                    >
                        {submitting ? 'Submitting...' : 'Request Booking'}
                    </button>
                </form>
            )}
        </div>
    );
}