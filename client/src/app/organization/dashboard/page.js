'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../../lib/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Building2, Calendar as CalendarIcon, Users, Settings, Plus, Key, Clock, Check, X, Building, ChevronRight, MapPin, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function OrgDashboardPage() {
    const router = useRouter();
    const authFetch = useAuthStore((state) => state.authFetch);
    const user = useAuthStore((state) => state.user);
    const loading = useAuthStore((state) => state.loading);

    const [organizations, setOrganizations] = useState([]);
    const [selectedHallId, setSelectedHallId] = useState('');
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState('');
    const [actionLoadingId, setActionLoadingId] = useState(null);

    const [joinRequests, setJoinRequests] = useState({});
    const [inviteCodes, setInviteCodes] = useState({});

    // Modals state
    const [deleteOrg, setDeleteOrg] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [auditBooking, setAuditBooking] = useState(null);
    const [auditLoading, setAuditLoading] = useState(false);

    useEffect(() => {
        if (loading || !user) return;
        loadMyOrgs();
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
        loadJoinRequests(orgId);
    }

    async function loadMyOrgs() {
        const { response, data } = await authFetch('/organizations/mine');
        if (response.ok) {
            setOrganizations(data.organizations || []);
        }
    }

    async function handleDeleteSubmit() {
        setIsSubmitting(true);
        const { response, data } = await authFetch(`/organizations/${deleteOrg.id}`, {
            method: 'DELETE'
        });
        setIsSubmitting(false);
        if (response.ok) {
            setDeleteOrg(null);
            loadMyOrgs();
        } else {
            setError(data?.message || 'Could not delete organization');
        }
    }

    async function handleViewAudit(bookingId) {
        setAuditLoading(true);
        const { response, data } = await authFetch(`/bookings/${bookingId}`);
        setAuditLoading(false);
        if (response.ok && data.booking) {
            setAuditBooking(data.booking);
        } else {
            setError('Could not load audit trail.');
        }
    }

    if (loading) return (
        <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );
    if (!user) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-xl border border-red-200 dark:border-red-900/50 text-center max-w-sm">
                <p className="text-red-600 dark:text-red-300 mb-4 font-medium">Please log in to view your organizations.</p>
                <Button variant="outline" onClick={() => router.push('/login')} className="border-red-200 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/50 w-full">Log in</Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-muted/30 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Host Dashboard</h1>
                        <p className="text-muted-foreground">Manage your venues, bookings, and team members.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => router.push('/dashboard')}>Switch to Guest</Button>
                        <Button onClick={() => router.push('/list-venue')} className="gap-2"><Plus className="w-4 h-4" /> Add Venue</Button>
                    </div>
                </div>

                {error && <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 border border-red-200 dark:border-red-900/50 rounded-xl text-sm font-medium">{error}</div>}

                {organizations.length === 0 ? (
                    <Card className="border-dashed border-2 shadow-sm text-center py-16 bg-transparent">
                        <CardContent className="flex flex-col items-center justify-center">
                            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                <Building2 className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">No Organizations Yet</h3>
                            <p className="text-muted-foreground max-w-md mb-6">
                                You don't administer any organizations or venues yet. Start by listing a venue to create your first organization.
                            </p>
                                <Button onClick={() => router.push('/list-venue')} size="lg">List a Venue</Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Organizations List */}
                        <div className="lg:col-span-2 space-y-6">
                            {organizations.map((org) => (
                                <Card key={org.id} className="shadow-md border-border overflow-hidden">
                                    <CardHeader className="bg-muted/30 border-b border-border pb-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center">
                                                    <Building className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <CardTitle className="text-xl">{org.name}</CardTitle>
                                                        {org.myRole === 'org_admin' && (
                                                            <div className="flex gap-2">
                                                                <Button variant="outline" size="sm" onClick={() => router.push(`/organization/dashboard/${org.id}`)}>
                                                                    Manage
                                                                </Button>
                                                                <Button variant="destructive" size="sm" onClick={() => setDeleteOrg(org)}>
                                                                    Delete
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2 mt-1">
                                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${org.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                                            {org.status.charAt(0).toUpperCase() + org.status.slice(1)}
                                                        </span>
                                                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-secondary text-secondary-foreground">
                                                            Role: {org.myRole === 'org_admin' ? 'Admin' : 'Co-Admin'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    
                                    <CardContent className="p-0">
                                        <div className="p-6 border-b border-border">
                                            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                                                <MapPin className="w-4 h-4" /> Venues
                                            </h4>
                                            {org.halls.length === 0 ? (
                                                <p className="text-sm text-muted-foreground italic">No halls yet under this organization.</p>
                                            ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {org.halls.map((hall) => (
                                                        <button
                                                            key={hall.id}
                                                            onClick={() => loadBookings(hall.id)}
                                                            className={`text-left border rounded-lg p-4 transition-all hover:border-primary/50 flex justify-between items-center group ${selectedHallId === hall.id ? 'border-primary ring-1 ring-primary bg-primary/5' : 'bg-card'}`}
                                                        >
                                                            <div>
                                                                <p className="font-semibold text-sm">{hall.name}</p>
                                                                <p className="text-xs text-muted-foreground mt-1 truncate">{hall.location_area}</p>
                                                            </div>
                                                            <ChevronRight className={`w-4 h-4 transition-colors ${selectedHallId === hall.id ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Admin Controls */}
                                        {org.myRole === 'org_admin' && (
                                            <div className="p-6 bg-muted/10">
                                                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                                                    <Users className="w-4 h-4" /> Team Management
                                                </h4>
                                                
                                                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                                                    <Button variant="outline" size="sm" onClick={() => generateInviteCode(org.id)} className="gap-2">
                                                        <Key className="w-4 h-4" /> Generate Invite Code
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => loadJoinRequests(org.id)} className="gap-2">
                                                        <Clock className="w-4 h-4" /> View Pending Requests
                                                    </Button>
                                                </div>

                                                {inviteCodes[org.id] && (
                                                    <div className="bg-primary/5 border border-primary/20 rounded-md p-3 mb-4 flex items-center justify-between">
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Invite Code (Expires in 24h)</p>
                                                            <p className="font-mono text-lg font-bold tracking-widest text-primary">{inviteCodes[org.id].code}</p>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Valid till: {new Date(inviteCodes[org.id].expiresAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                        </p>
                                                    </div>
                                                )}

                                                {joinRequests[org.id] && (
                                                    <div className="space-y-2 mt-4">
                                                        <p className="text-sm font-medium mb-2">Pending Join Requests</p>
                                                        {joinRequests[org.id].length === 0 ? (
                                                            <p className="text-muted-foreground text-sm italic">No pending requests.</p>
                                                        ) : (
                                                            joinRequests[org.id].map((req) => (
                                                                <div key={req.id} className="flex justify-between items-center border border-border bg-card rounded-md p-3">
                                                                    <div>
                                                                        <p className="text-sm font-medium">{req.users.name}</p>
                                                                        <p className="text-xs text-muted-foreground">{req.users.email}</p>
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleJoinRequestDecision(org.id, req.id, 'approve')}>
                                                                            <Check className="w-4 h-4" />
                                                                        </Button>
                                                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleJoinRequestDecision(org.id, req.id, 'reject')}>
                                                                            <X className="w-4 h-4" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Bookings Panel */}
                        <div className="lg:col-span-1">
                            <Card className="shadow-lg border-border sticky top-24">
                                <CardHeader className="bg-muted/30 border-b border-border">
                                    <div className="flex items-center gap-2 mb-1">
                                        <CalendarIcon className="w-5 h-5 text-primary" />
                                        <CardTitle className="text-lg">Booking Requests</CardTitle>
                                    </div>
                                    <CardDescription>
                                        {selectedHallId ? "Review and manage reservations" : "Select a venue to view bookings"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {!selectedHallId ? (
                                        <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[300px]">
                                            <Building className="w-12 h-12 mb-3 text-muted/50" />
                                            <p className="text-sm">Click on a venue from your organizations to see its bookings.</p>
                                        </div>
                                    ) : bookings.length === 0 ? (
                                        <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[300px]">
                                            <p className="text-sm">No bookings found for this venue.</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col max-h-[600px] overflow-y-auto">
                                            {bookings.map((booking) => (
                                                <div key={booking.id} className="p-5 border-b border-border last:border-0 hover:bg-muted/10 transition-colors">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <p className="text-xs font-mono text-muted-foreground mb-1">ID: {booking.id.substring(0,8)}...</p>
                                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                                booking.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                                booking.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                                booking.status === 'checked_in' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                                booking.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                                booking.status === 'no_show' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                                                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                            }`}>
                                                                {booking.status.toUpperCase()}
                                                            </span>
                                                            {booking.payment_status && (
                                                                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium border ${
                                                                    booking.payment_status === 'paid' ? 'border-green-300 text-green-600 bg-green-50' :
                                                                    'border-orange-300 text-orange-600 bg-orange-50'
                                                                }`}>
                                                                    {booking.payment_status.toUpperCase()}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <button 
                                                            onClick={() => handleViewAudit(booking.id)}
                                                            className="text-xs text-primary hover:underline"
                                                        >
                                                            View Audit
                                                        </button>
                                                    </div>
                                                    
                                                    {/* Booking Details usually go here (User info, Date, Time) */}
                                                    <div className="text-sm space-y-1 mb-4 text-foreground/80">
                                                        <p><span className="text-muted-foreground">Start:</span> {new Date(booking.start_time).toLocaleString()}</p>
                                                        <p><span className="text-muted-foreground">End:</span> {new Date(booking.end_time).toLocaleString()}</p>
                                                    </div>

                                                    {booking.status === 'requested' && (
                                                        <div className="flex gap-2 mt-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleDecision(booking.id, 'approve')}
                                                                disabled={actionLoadingId === booking.id}
                                                                className="flex-1 bg-green-50 text-green-700 hover:bg-green-100 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                                                            >
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleDecision(booking.id, 'reject')}
                                                                disabled={actionLoadingId === booking.id}
                                                                className="flex-1 bg-red-50 text-red-700 hover:bg-red-100 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                                                            >
                                                                Reject
                                                            </Button>
                                                        </div>
                                                    )}
                                                    {booking.status === 'approved' && (
                                                        <div className="flex gap-2 mt-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleDecision(booking.id, 'check-in')}
                                                                disabled={actionLoadingId === booking.id}
                                                                className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                                                            >
                                                                Check In
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleDecision(booking.id, 'no-show')}
                                                                disabled={actionLoadingId === booking.id}
                                                                className="flex-1 bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
                                                            >
                                                                No Show
                                                            </Button>
                                                        </div>
                                                    )}
                                                    {booking.status === 'checked_in' && (
                                                        <div className="flex gap-2 mt-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleDecision(booking.id, 'complete')}
                                                                disabled={actionLoadingId === booking.id}
                                                                className="flex-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                                                            >
                                                                Complete
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {deleteOrg && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-md shadow-2xl border-red-500/50">
                        <CardHeader>
                            <CardTitle className="text-red-600 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" /> Delete Organization
                            </CardTitle>
                            <CardDescription>
                                Are you sure you want to permanently delete <strong>{deleteOrg.name}</strong>? This will delete all its venues, bookings, and team members. This action cannot be undone.
                            </CardDescription>
                        </CardHeader>
                        <div className="flex justify-end gap-2 p-6">
                            <Button variant="outline" onClick={() => setDeleteOrg(null)} disabled={isSubmitting}>Cancel</Button>
                            <Button variant="destructive" onClick={handleDeleteSubmit} disabled={isSubmitting}>Yes, Delete Organization</Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Audit Modal */}
            {auditBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-lg shadow-2xl border-border">
                        <CardHeader className="border-b border-border pb-4">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Clock className="w-5 h-5 text-primary" /> Booking Audit Trail
                            </CardTitle>
                            <CardDescription>
                                Timeline of actions for booking ID {auditBooking.id.substring(0,8)}...
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 max-h-[60vh] overflow-y-auto">
                            {!auditBooking.actions || auditBooking.actions.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center italic">No actions recorded.</p>
                            ) : (
                                <div className="space-y-4">
                                    {auditBooking.actions.map((act, index) => (
                                        <div key={act.id} className="flex gap-4 relative">
                                            {/* Vertical line connecting timeline items */}
                                            {index !== auditBooking.actions.length - 1 && (
                                                <div className="absolute left-[11px] top-6 bottom-[-16px] w-[2px] bg-border"></div>
                                            )}
                                            <div className="w-6 h-6 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center z-10 border border-primary/50">
                                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                                            </div>
                                            <div className="flex-1 pb-2">
                                                <p className="text-sm font-semibold capitalize">{act.action.replace('_', ' ')}</p>
                                                <div className="flex justify-between items-center mt-1">
                                                    <p className="text-xs text-muted-foreground">
                                                        by {act.acting_user_name || 'User'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground font-mono">
                                                        {new Date(act.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                        <div className="flex justify-end gap-2 p-6 border-t border-border bg-muted/30">
                            <Button variant="outline" onClick={() => setAuditBooking(null)}>Close</Button>
                        </div>
                    </Card>
                </div>
            )}

        </div>
    );
}