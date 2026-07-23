'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../app/components/ui/Card';
import { Button } from '../../app/components/ui/Button';
import { CalendarIcon, Clock, Building, CalendarDays, Activity, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../app/lib/authStore';
import Link from 'next/link';

export default function BookingManagement() {
    const authFetch = useAuthStore((state) => state.authFetch);
    const [organization, setOrganization] = useState(null);
    const [selectedHallId, setSelectedHallId] = useState('');
    const [bookings, setBookings] = useState([]);
    const [loadingOrg, setLoadingOrg] = useState(true);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [error, setError] = useState('');
    const [actionLoadingId, setActionLoadingId] = useState(null);

    useEffect(() => {
        async function loadOrg() {
            setLoadingOrg(true);
            const { response, data } = await authFetch('/organizations/mine');
            if (response.ok && data.organization) {
                setOrganization(data.organization);
                if (data.organization.halls && data.organization.halls.length > 0) {
                    setSelectedHallId(data.organization.halls[0].id);
                }
            }
            setLoadingOrg(false);
        }
        loadOrg();
    }, [authFetch]);

    useEffect(() => {
        if (selectedHallId) {
            loadBookings(selectedHallId);
        }
    }, [selectedHallId]);

    async function loadBookings(hallId) {
        setLoadingBookings(true);
        setError('');
        const { response, data } = await authFetch(`/bookings/hall/${hallId}`);
        setLoadingBookings(false);
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

    if (loadingOrg) {
        return (
            <div className="flex justify-center items-center h-[80vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (organization?.status !== 'approved') {
        return (
            <div className="max-w-6xl mx-auto p-6 lg:p-8">
                <Card className="bg-yellow-500/10 border-yellow-500/20 rounded-2xl">
                    <CardContent className="p-8 flex items-start gap-4">
                        <div className="p-3 bg-yellow-500/20 rounded-full">
                            <Activity className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-yellow-600 dark:text-yellow-500">Pending Approval</h3>
                            <p className="text-sm text-yellow-700/80 dark:text-yellow-400/80 mt-1">
                                Your organization is currently pending approval. You can manage bookings once it is approved by a Super Admin.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-6 lg:p-8 pb-20">
            {/* Header */}
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between md:items-end gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
                        <CalendarDays className="w-8 h-8 text-primary" /> Booking Management
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-lg">
                        Manage reservation requests, approve upcoming events, and track schedules across your venues.
                    </p>
                </div>
                
                {organization.halls && organization.halls.length > 0 && (
                    <div className="relative z-10 w-full md:w-64">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Select Venue</label>
                        <select 
                            value={selectedHallId} 
                            onChange={(e) => setSelectedHallId(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all shadow-sm font-medium cursor-pointer appearance-none"
                        >
                            {organization.halls.map(h => (
                                <option key={h.id} value={h.id}>{h.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 text-red-600 border border-red-500/20 rounded-xl text-sm font-medium flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> {error}
                </div>
            )}

            <Card className="shadow-sm border-border bg-card rounded-2xl overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/50 p-6">
                    <CardTitle className="text-lg">Reservations List</CardTitle>
                    <CardDescription>All bookings for the selected venue.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {loadingBookings ? (
                        <div className="flex justify-center items-center h-48 bg-muted/5">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : !selectedHallId ? (
                        <div className="p-16 text-center text-muted-foreground flex flex-col items-center justify-center bg-muted/5">
                            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                <Building className="w-10 h-10 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">Create a venue first</h3>
                            <p className="text-sm max-w-sm mb-6">You need to have at least one venue to receive and manage bookings.</p>
                            <Link href="/list-venue">
                                <Button variant="outline" className="rounded-xl px-6">Add Venue</Button>
                            </Link>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="p-16 text-center text-muted-foreground flex flex-col items-center justify-center bg-muted/5">
                            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                <CalendarIcon className="w-10 h-10 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">No bookings found</h3>
                            <p className="text-sm max-w-sm">There are no reservation requests for this venue yet.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/50">
                            {bookings.map((booking) => (
                                <div key={booking.id} className="p-6 hover:bg-muted/30 transition-colors">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                        
                                        <div className="space-y-3 flex-1 w-full">
                                            {/* Status Badges */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`text-[11px] px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                                                    booking.status === 'requested' ? 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20' :
                                                    booking.status === 'approved' ? 'bg-primary/10 text-primary border border-primary/20' :
                                                    booking.status === 'rejected' ? 'bg-red-500/10 text-red-600 border border-red-500/20' :
                                                    booking.status === 'checked_in' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' :
                                                    booking.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                                                    booking.status === 'no_show' ? 'bg-orange-500/10 text-orange-600 border border-orange-500/20' :
                                                    'bg-muted/50 text-muted-foreground border border-border'
                                                }`}>
                                                    {booking.status}
                                                </span>
                                                
                                                {booking.payment_status && (
                                                    <span className={`text-[11px] px-3 py-1 rounded-full font-bold uppercase tracking-wider border ${
                                                        booking.payment_status === 'paid' ? 'border-green-500/30 text-green-600 bg-green-500/10' :
                                                        'border-orange-500/30 text-orange-600 bg-orange-500/10'
                                                    }`}>
                                                        {booking.payment_status}
                                                    </span>
                                                )}
                                                
                                                <span className="text-[11px] font-mono font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-md border border-border/50">
                                                    ID: {booking.id.substring(0,8)}
                                                </span>
                                            </div>
                                            
                                            {/* Booking Details */}
                                            <div className="bg-background rounded-xl p-4 border border-border/50 shadow-sm flex flex-col sm:flex-row gap-4 sm:items-center">
                                                <div className="flex-1">
                                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Customer</p>
                                                    <p className="font-semibold text-foreground flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs">
                                                            {(booking.users?.name || 'U')[0].toUpperCase()}
                                                        </div>
                                                        {booking.users?.name || 'Unknown'}
                                                    </p>
                                                </div>
                                                
                                                <div className="hidden sm:block w-px h-10 bg-border/50"></div>
                                                
                                                <div className="flex-1">
                                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Schedule</p>
                                                    <div className="flex flex-col gap-1 text-sm font-medium">
                                                        <span className="flex items-center gap-1.5 text-foreground">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                            {new Date(booking.time_range.split(',')[0].replace(/[\(\[]/g, '')).toLocaleString()}
                                                        </span>
                                                        <span className="flex items-center gap-1.5 text-foreground">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                                            {new Date(booking.time_range.split(',')[1].replace(/[\)\]]/g, '')).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-wrap md:flex-col gap-2 w-full md:w-32 shrink-0 md:mt-11">
                                            {booking.status === 'requested' && (
                                                <>
                                                    <Button size="sm" onClick={() => handleDecision(booking.id, 'approve')} disabled={actionLoadingId === booking.id} className="flex-1 md:w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm rounded-lg font-medium">
                                                        <CheckCircle className="w-4 h-4 mr-1.5" /> Approve
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={() => handleDecision(booking.id, 'reject')} disabled={actionLoadingId === booking.id} className="flex-1 md:w-full text-red-600 hover:text-red-700 hover:bg-red-500/10 border-red-500/20 rounded-lg">
                                                        <XCircle className="w-4 h-4 mr-1.5" /> Reject
                                                    </Button>
                                                </>
                                            )}
                                            {booking.status === 'approved' && (
                                                <>
                                                    <Button size="sm" onClick={() => handleDecision(booking.id, 'check-in')} disabled={actionLoadingId === booking.id} className="flex-1 md:w-full bg-blue-500 text-white hover:bg-blue-600 shadow-sm rounded-lg font-medium">
                                                        <ArrowRight className="w-4 h-4 mr-1.5" /> Check In
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={() => handleDecision(booking.id, 'no-show')} disabled={actionLoadingId === booking.id} className="flex-1 md:w-full text-orange-600 hover:text-orange-700 hover:bg-orange-500/10 border-orange-500/20 rounded-lg">
                                                        No Show
                                                    </Button>
                                                </>
                                            )}
                                            {booking.status === 'checked_in' && (
                                                <Button size="sm" onClick={() => handleDecision(booking.id, 'complete')} disabled={actionLoadingId === booking.id} className="w-full bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm rounded-lg font-medium">
                                                    <CheckCircle className="w-4 h-4 mr-1.5" /> Complete
                                                </Button>
                                            )}
                                            {['rejected', 'completed', 'no_show'].includes(booking.status) && (
                                                <div className="w-full text-center text-xs font-medium text-muted-foreground uppercase tracking-wider py-2 bg-muted/30 rounded-lg border border-border/50">
                                                    Action Finalized
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
