'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '../../lib/api';
import { useAuthStore } from '../../lib/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { MapPin, Users, Star, ArrowLeft, Share, Heart, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

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

    if (loading) return (
        <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );
    if (error) return <div className="p-8 text-center text-red-600 max-w-lg mx-auto mt-10 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/50">{error}</div>;
    if (!hall) return null;

    const mainPhoto = hall.photos && hall.photos.length > 0 
        ? hall.photos[0] 
        : 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200';
    
    // For the right column grid
    const sidePhotos = [
        'https://images.unsplash.com/photo-1530103862676-de8892bf309c?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=400'
    ];

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Top Bar */}
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Explore
                </Link>
                <div className="flex gap-4">
                    <button className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        <Share className="w-4 h-4 mr-2" /> Share
                    </button>
                    <button className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        <Heart className="w-4 h-4 mr-2" /> Save
                    </button>
                </div>
            </div>

            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Photo Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 h-[40vh] md:h-[60vh] rounded-2xl overflow-hidden mb-10">
                    <div className="md:col-span-3 relative h-full">
                        <img src={mainPhoto} alt={hall.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="hidden md:flex flex-col gap-4 h-full">
                        <div className="relative h-1/2">
                            <img src={sidePhotos[0]} className="w-full h-full object-cover" alt="Detail 1" />
                        </div>
                        <div className="relative h-1/2">
                            <img src={sidePhotos[1]} className="w-full h-full object-cover" alt="Detail 2" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/50 transition-colors">
                                <span className="text-white font-medium">+ View all photos</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Main Content */}
                    <div className="lg:w-2/3">
                        <div className="mb-2">
                            <span className="inline-block bg-primary/10 text-primary px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider mb-3">
                                {hall.venue_tier}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{hall.name}</h1>
                        
                        <div className="flex items-center gap-6 text-muted-foreground mb-8 pb-8 border-b border-border">
                            <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{hall.location_area}</span>
                            </div>
                            <div className="flex items-center gap-1 text-primary">
                                <Star className="w-4 h-4 fill-primary" />
                                <span className="font-medium">4.8</span>
                                <span className="text-muted-foreground ml-1">(128 reviews)</span>
                            </div>
                        </div>

                        {/* Specs */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                            <div>
                                <p className="text-2xl font-bold">{hall.capacity}</p>
                                <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Capacity</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">6.4 m</p>
                                <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Ceiling Height</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">8500 sq.ft</p>
                                <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Total Area</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">Indoor</p>
                                <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Space Type</p>
                            </div>
                        </div>

                        <div className="prose prose-gray dark:prose-invert max-w-none">
                            <h3 className="text-xl font-semibold mb-4">About this venue</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                A stunning industrial-chic loft with panoramic city views, exposed brick, and a versatile open layout perfect for modern celebrations and corporate events. {hall.name} provides the perfect canvas to bring your vision to life, complete with state-of-the-art amenities.
                            </p>
                        </div>
                    </div>

                    {/* Booking Sidebar */}
                    <div className="lg:w-1/3">
                        <div className="sticky top-24">
                            <Card className="border-border shadow-xl">
                                <CardHeader>
                                    <div className="flex items-end gap-2 mb-2">
                                        <h2 className="text-3xl font-bold">₹{Number(hall.price_per_slot).toLocaleString('en-IN')}</h2>
                                        <span className="text-muted-foreground pb-1">/ slot</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Includes standard taxes & fees</p>
                                </CardHeader>
                                <CardContent>
                                    {bookingResult ? (
                                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-900/50 text-center">
                                            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                            <h3 className="font-semibold text-green-900 dark:text-green-400 mb-1">Booking Requested</h3>
                                            <p className="text-sm text-green-700 dark:text-green-500 mb-4">
                                                Status: <strong className="uppercase">{bookingResult.status}</strong>
                                            </p>
                                            <Button 
                                                variant="outline" 
                                                className="w-full border-green-200 hover:bg-green-100 dark:border-green-800 dark:hover:bg-green-900/50"
                                                onClick={() => router.push(`/bookings/${bookingResult.id}`)}
                                            >
                                                View Status
                                            </Button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleBookingSubmit} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Start Time</label>
                                                    <Input type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">End Time</label>
                                                    <Input type="time" required value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</label>
                                                <Input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
                                            </div>

                                            {bookingError && <p className="text-sm text-red-500 font-medium bg-red-50 dark:bg-red-950/20 p-2 rounded border border-red-100 dark:border-red-900/50">{bookingError}</p>}

                                            <Button type="submit" variant="primary" size="lg" className="w-full font-semibold mt-2" disabled={submitting}>
                                                {submitting ? 'Processing...' : 'Request Booking'}
                                            </Button>
                                            
                                            <p className="text-xs text-center text-muted-foreground mt-4">You won't be charged yet</p>
                                        </form>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}