/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '../../lib/api';
import { useAuthStore } from '../../lib/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { MapPin, Users, Star, ArrowLeft, Share, Heart, CheckCircle2, Wifi, Car, Coffee, Speaker, MoreHorizontal, MessageSquare } from 'lucide-react';
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
        <div className="flex justify-center items-center h-screen bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );
    if (error) return <div className="p-8 text-center text-red-600 max-w-lg mx-auto mt-10 bg-red-950/20 rounded-xl border border-red-900/50">{error}</div>;
    if (!hall) return null;

    const mainPhoto = hall.photos && hall.photos.length > 0 
        ? hall.photos[0] 
        : 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200';
    
    const sidePhotos = [
        hall.photos?.[1] || 'https://images.unsplash.com/photo-1530103862676-de8892bf309c?auto=format&fit=crop&q=80&w=400',
        hall.photos?.[2] || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=400'
    ];

    return (
        <div className="min-h-screen bg-background text-foreground pb-20 font-sans">
            {/* Top Bar */}
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center border-b border-border mb-6">
                <div className="flex items-center gap-8">
                    <div className="font-extrabold text-2xl tracking-tight text-foreground">
                        Resvo<span className="text-primary">.</span>
                    </div>
                    <Link href="/dashboard/explore" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Explore
                    </Link>
                </div>
                <div className="flex gap-4">
                    <button className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border border-border px-3 py-1.5 rounded-full hover:border-primary">
                        <Share className="w-4 h-4 mr-2" /> Share
                    </button>
                    <button className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border border-border px-3 py-1.5 rounded-full hover:border-primary">
                        <Heart className="w-4 h-4 mr-2" /> Save
                    </button>
                </div>
            </div>

            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Photo Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[40vh] md:h-[60vh] rounded-2xl overflow-hidden mb-10">
                    <div className="md:col-span-3 relative h-full">
                        <img src={mainPhoto} alt={hall.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="hidden md:flex flex-col gap-2 h-full">
                        <div className="relative h-1/2">
                            <img src={sidePhotos[0]} className="w-full h-full object-cover" alt="Detail 1" />
                        </div>
                        <div className="relative h-1/2">
                            <img src={sidePhotos[1]} className="w-full h-full object-cover" alt="Detail 2" />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer hover:bg-black/40 transition-colors">
                                <span className="text-white font-medium">+24</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Main Content */}
                    <div className="lg:w-2/3">
                        <div className="mb-4">
                            <span className="inline-block bg-primary/20 border border-primary/50 text-primary px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-widest mb-3">
                                {hall.venue_tier || 'Premium'}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{hall.name}</h1>
                        
                        <div className="flex items-center gap-6 text-muted-foreground mb-8">
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

                        {/* Specs Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 pb-10 border-b border-border">
                            <div>
                                <p className="text-3xl font-light mb-1">{hall.capacity}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Capacity</p>
                            </div>
                            <div>
                                <p className="text-3xl font-light mb-1">6.4 m</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Ceiling Height</p>
                            </div>
                            <div>
                                <p className="text-3xl font-light mb-1">8500 <span className="text-lg">sq.ft</span></p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Total Area</p>
                            </div>
                            <div>
                                <p className="text-3xl font-light mb-1">Indoor</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Space Type</p>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-8 border-b border-border mb-8">
                            <button className="text-primary border-b-2 border-primary pb-4 font-medium text-sm">Overview</button>
                            <button className="text-muted-foreground hover:text-foreground pb-4 font-medium text-sm transition-colors">Amenities</button>
                            <button className="text-muted-foreground hover:text-foreground pb-4 font-medium text-sm transition-colors">Gallery</button>
                            <button className="text-muted-foreground hover:text-foreground pb-4 font-medium text-sm transition-colors">Reviews</button>
                            <button className="text-muted-foreground hover:text-foreground pb-4 font-medium text-sm transition-colors">Location</button>
                        </div>

                        <div className="mb-10">
                            <p className="text-muted-foreground leading-relaxed">
                                A stunning industrial-chic loft with panoramic city views, exposed brick, and a versatile open layout perfect for modern celebrations and corporate events. {hall.name} provides the perfect canvas to bring your vision to life, complete with state-of-the-art amenities.
                            </p>
                        </div>

                        {/* Amenities Icons */}
                        <div className="flex gap-6 mb-12">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-muted-foreground">
                                    <Wifi className="w-5 h-5" />
                                </div>
                                <span className="text-xs text-muted-foreground">Wi-Fi</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-muted-foreground">
                                    <Car className="w-5 h-5" />
                                </div>
                                <span className="text-xs text-muted-foreground">Parking</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-muted-foreground">
                                    <Coffee className="w-5 h-5" />
                                </div>
                                <span className="text-xs text-muted-foreground">Catering</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-muted-foreground">
                                    <Speaker className="w-5 h-5" />
                                </div>
                                <span className="text-xs text-muted-foreground">Audio System</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-muted-foreground">
                                    <MoreHorizontal className="w-5 h-5" />
                                </div>
                                <span className="text-xs text-muted-foreground">More</span>
                            </div>
                        </div>

                        {/* Availability Calendar (Mockup style) */}
                        <div className="mb-10">
                            <h3 className="text-xl font-semibold mb-6">Availability</h3>
                            <div className="bg-card border border-border rounded-xl p-6">
                                <p className="text-sm font-medium mb-4">October 2024</p>
                                <div className="flex justify-between items-center text-center">
                                    <div><p className="text-xs text-muted-foreground mb-2">Su</p><p className="text-sm">20</p></div>
                                    <div><p className="text-xs text-muted-foreground mb-2">Mo</p><p className="text-sm">21</p></div>
                                    <div><p className="text-xs text-muted-foreground mb-2">Tu</p><p className="text-sm">22</p></div>
                                    <div><p className="text-xs text-muted-foreground mb-2">We</p><p className="text-sm">23</p></div>
                                    <div className="bg-primary/20 text-primary border border-primary/50 rounded p-1 px-3"><p className="text-xs mb-1">Th</p><p className="text-sm font-bold">24</p></div>
                                    <div className="bg-primary/20 text-primary border border-primary/50 rounded p-1 px-3"><p className="text-xs mb-1">Fr</p><p className="text-sm font-bold">25</p></div>
                                    <div className="bg-primary/20 text-primary border border-primary/50 rounded p-1 px-3"><p className="text-xs mb-1">Sa</p><p className="text-sm font-bold">26</p></div>
                                </div>
                                <div className="flex gap-4 mt-6 pt-4 border-t border-border">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground"><div className="w-2 h-2 rounded-full bg-slate-500"></div> Available</div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground"><div className="w-2 h-2 rounded-full bg-primary/50"></div> Tentative</div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground"><div className="w-2 h-2 rounded-full bg-primary"></div> Booked</div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Booking Sidebar */}
                    <div className="lg:w-1/3">
                        <div className="sticky top-8 space-y-6">
                            <Card className="bg-card border-border shadow-2xl">
                                <CardHeader className="pb-4">
                                    <div className="flex items-end gap-2 mb-1">
                                        <h2 className="text-3xl font-bold">₹{Number(hall.price_per_slot).toLocaleString('en-IN')} <span className="text-lg font-normal text-muted-foreground">/ day</span></h2>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Includes taxes & fees</p>
                                </CardHeader>
                                <CardContent>
                                    {user?.role === 'ORG_ADMIN' ? (
                                        <div className="bg-primary/5 p-6 rounded-xl border border-primary/20 text-center space-y-4">
                                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                                                <CheckCircle2 className="w-6 h-6 text-primary" />
                                            </div>
                                            <h3 className="font-semibold text-lg">You are an Organizer</h3>
                                            <p className="text-sm text-muted-foreground">
                                                You are viewing the public preview of this venue. The booking form is hidden for organizers.
                                            </p>
                                            <Button 
                                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold mt-2"
                                                onClick={() => router.push(`/list-venue?edit=${id}`)}
                                            >
                                                Edit Venue Details
                                            </Button>
                                            <Button 
                                                variant="outline"
                                                className="w-full border-border hover:bg-muted font-medium"
                                                onClick={() => router.push(`/organization/halls`)}
                                            >
                                                Back to Dashboard
                                            </Button>
                                        </div>
                                    ) : bookingResult ? (
                                        <div className="bg-green-950/30 p-6 rounded-xl border border-green-900/50 text-center">
                                            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                            <h3 className="font-semibold text-green-400 mb-1">Booking Requested</h3>
                                            <p className="text-sm text-green-500 mb-6">
                                                Status: <strong className="uppercase">{bookingResult.status}</strong>
                                            </p>
                                            <Button 
                                                className="w-full bg-green-600 hover:bg-green-700 text-white border-none"
                                                onClick={() => router.push(`/dashboard/bookings`)}
                                            >
                                                View in Bookings
                                            </Button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleBookingSubmit} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Check-in</label>
                                                    <Input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="bg-background border-border text-sm" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Check-out</label>
                                                    <Input type="date" required className="bg-background border-border text-sm" />
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Start Time</label>
                                                    <Input type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} className="bg-background border-border text-sm" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">End Time</label>
                                                    <Input type="time" required value={endTime} onChange={(e) => setEndTime(e.target.value)} className="bg-background border-border text-sm" />
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Guests</label>
                                                <select className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none">
                                                    <option>400</option>
                                                    <option>300</option>
                                                    <option>200</option>
                                                </select>
                                            </div>

                                            {bookingError && <p className="text-sm text-red-400 font-medium bg-red-950/30 p-3 rounded border border-red-900/50">{bookingError}</p>}

                                            <div className="pt-2 flex flex-col gap-3">
                                                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base py-6 rounded-lg" disabled={submitting}>
                                                    {submitting ? 'Processing...' : 'Request Booking'}
                                                </Button>
                                                <Button type="button" variant="outline" className="w-full border-border hover:bg-muted text-foreground font-medium py-6 rounded-lg">
                                                    Contact Host
                                                </Button>
                                            </div>
                                            
                                            <p className="text-xs text-center text-muted-foreground mt-2">Usually responds in 2 hours</p>
                                        </form>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Host Profile */}
                            <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                                        <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100" alt="Host" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">Arjun Mehta</p>
                                        <p className="text-xs text-muted-foreground">Venue Manager</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="border-border text-xs gap-2">
                                    <MessageSquare className="w-3 h-3" /> Message
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}