'use client';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../lib/authStore';
import Link from 'next/link';
import { toast } from 'sonner';
import { CalendarDays, Heart, PlusCircle, ArrowRight, ShieldCheck, Clock, BookOpen, Search, Mail, ReceiptText } from 'lucide-react';

export default function Page() {
    const user = useAuthStore(state => state.user);
    const authFetch = useAuthStore(state => state.authFetch);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const formatTimeRange = (rangeStr) => {
        if (!rangeStr) return '';
        const clean = rangeStr.replace(/[\[\]\(\)]/g, '');
        const [start, end] = clean.split(',').map(s => s.trim().replace(/"/g, ''));
        const startDate = new Date(start);
        const endDate = new Date(end);
        return `${startDate.toLocaleDateString()} • ${startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    };

    useEffect(() => {
        async function fetchDashboardData() {
            if (!user) return;
            try {
                // Fetch Bookings
                const bookRes = await authFetch('/bookings');
                if (bookRes.response?.ok && bookRes.data?.bookings) {
                    setBookings(bookRes.data.bookings);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchDashboardData();
    }, [authFetch, user]);

    const firstName = user?.name?.split(' ')[0] || 'User';

    async function handleCancel(bookingId) {
        if (!confirm('Are you sure you want to cancel this booking?')) return;
        const { response } = await authFetch(`/bookings/${bookingId}/cancel`, { method: 'POST' });
        if (response.ok) {
            // refresh bookings
            const bookRes = await authFetch('/bookings');
            if (bookRes.response?.ok && bookRes.data?.bookings) {
                setBookings(bookRes.data.bookings);
                toast.success('Booking cancelled.');
            }
        } else {
            toast.error('Could not cancel booking.');
        }
    }

    async function handlePayment(bookingId) {
        const { response, data } = await authFetch(`/bookings/${bookingId}/pay`, { method: 'POST' });
        if (response.ok) {
            toast.success('Payment Successful!');
            const bookRes = await authFetch('/bookings');
            if (bookRes.response?.ok && bookRes.data?.bookings) {
                setBookings(bookRes.data.bookings);
            }
        } else {
            toast.error(data?.message || 'Payment failed.');
        }
    }

    // Calculate Dynamic Stats
    const upcomingBookingsCount = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending' || b.status === 'approved' || b.status === 'requested').length || 0;
    const totalSpent = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);

    return (
        <div className="min-h-screen bg-background text-foreground pb-12 p-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-semibold mb-2 flex items-center gap-2">
                        Good evening, {firstName} <span className="text-2xl">👋</span>
                    </h1>
                    <p className="text-muted-foreground">
                        Here's what's happening with your events.
                    </p>
                </div>
                <Link href="/dashboard/explore" className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-6 py-2.5 rounded-lg font-medium text-sm">
                    Explore Venues
                </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                <div className="bg-card border border-border p-6 rounded-xl flex flex-col justify-between">
                    <h2 className="text-4xl font-medium mb-4">{upcomingBookingsCount}</h2>
                    <p className="text-sm text-muted-foreground">Upcoming Bookings</p>
                </div>
                <div className="bg-card border border-border p-6 rounded-xl flex flex-col justify-between">
                    <h2 className="text-4xl font-medium mb-4">{bookings.length}</h2>
                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                </div>
                <div className="bg-card border border-border p-6 rounded-xl flex flex-col justify-between">
                    <h2 className="text-4xl font-medium mb-4">₹{totalSpent.toLocaleString()}</h2>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                </div>
            </div>

            {/* Split Row: Upcoming Bookings & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                {/* Upcoming Bookings */}
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Upcoming Bookings</h3>
                    </div>
                    
                    <div className="space-y-4">
                        {loading ? (
                            <div className="h-32 bg-muted animate-pulse rounded-xl"></div>
                        ) : bookings.length > 0 ? (
                            bookings.map(booking => (
                                <div key={booking.id} className="bg-card border border-border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
                                            <CalendarDays className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-base">{booking.hall_name}</h4>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                <Clock className="w-4 h-4" />
                                                <span>{formatTimeRange(booking.time_range)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                                            booking.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                                            booking.status === 'requested' ? 'bg-yellow-500/10 text-yellow-500' :
                                            booking.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                                            'bg-muted text-muted-foreground'
                                        }`}>
                                            {booking.status.replace('_', ' ')}
                                        </span>
                                        {booking.payment_status === 'pending' && booking.status === 'approved' && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 uppercase tracking-widest mt-1">
                                                Payment Pending
                                            </span>
                                        )}
                                        <div className="flex gap-3 items-center mt-2">
                                            {booking.payment_status === 'pending' && booking.status === 'approved' && (
                                                <button 
                                                    onClick={() => handlePayment(booking.id)}
                                                    className="text-xs font-semibold bg-primary text-primary-foreground px-3 py-1 rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                                                >
                                                    Pay Now
                                                </button>
                                            )}
                                            {(booking.status === 'requested' || booking.status === 'approved') && (
                                                <button 
                                                    onClick={() => handleCancel(booking.id)}
                                                    className="text-xs text-red-500 hover:text-red-700 hover:underline transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center justify-center text-center">
                                <CalendarDays className="w-8 h-8 text-muted-foreground mb-2" />
                                <h4 className="font-medium">No upcoming bookings</h4>
                                <p className="text-sm text-muted-foreground mt-1 mb-4">You have no upcoming events.</p>
                                <Link href="/dashboard/explore" className="text-sm text-primary hover:underline font-medium">
                                    Book a venue
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions & My Organizations */}
                <div className="flex flex-col gap-8">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/dashboard/explore" className="bg-card border border-border rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors group">
                                <Search className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                <span className="text-xs text-muted-foreground group-hover:text-foreground">Book Venue</span>
                            </Link>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-4 mt-8">
                            <h3 className="text-lg font-semibold">Switch to Hosting</h3>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-6 text-center shadow-sm">
                            <h4 className="font-medium text-foreground mb-2">Are you a venue owner?</h4>
                            <p className="text-sm text-muted-foreground mb-4">Manage your venues, view booking requests, and control your team from the Host Dashboard.</p>
                            <Link href="/organization/dashboard" className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-6 py-2 rounded-lg font-medium text-sm inline-block w-full">
                                Go to Host Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommended for You */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Recommended for You</h3>
                <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center justify-center text-center">
                    <Search className="w-8 h-8 text-muted-foreground mb-2" />
                    <h4 className="font-medium">No recommendations right now</h4>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">Check out our explore page to find venues.</p>
                    <Link href="/dashboard/explore" className="text-sm text-primary hover:underline font-medium">
                        Explore all venues
                    </Link>
                </div>
            </div>
        </div>
    );
}