'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../app/components/ui/Card';
import { Button } from '../../app/components/ui/Button';
import { MapPin, Plus, Edit, Trash2, Building, ChevronRight, Activity, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../app/lib/authStore';
import Link from 'next/link';

export default function HallManagement() {
    const router = useRouter();
    const authFetch = useAuthStore((state) => state.authFetch);
    const [organization, setOrganization] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadOrg() {
            setLoading(true);
            const { response, data } = await authFetch('/organizations/mine');
            if (response.ok && data.organization) {
                setOrganization(data.organization);
            }
            setLoading(false);
        }
        loadOrg();
    }, [authFetch]);

    if (loading) {
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
                                Your organization is currently pending approval. You can manage venues once it is approved by a Super Admin.
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
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between md:items-center gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
                        <Building2 className="w-8 h-8 text-primary" /> Venue Management
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your halls, spaces, and their configurations.
                    </p>
                </div>
                <Link href="/list-venue" className="relative z-10">
                    <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-6 h-12 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all w-full md:w-auto">
                        <Plus className="w-4 h-4" /> Add New Venue
                    </Button>
                </Link>
            </div>

            <Card className="shadow-sm border-border bg-card rounded-2xl overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/50 p-6">
                    <CardTitle className="text-lg">Your Venues</CardTitle>
                    <CardDescription>A complete list of all venues under your organization.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {!organization.halls || organization.halls.length === 0 ? (
                        <div className="p-16 text-center text-muted-foreground flex flex-col items-center justify-center bg-muted/10">
                            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                <Building className="w-10 h-10 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">No venues yet</h3>
                            <p className="text-sm max-w-sm mb-6">You haven't added any venues to your organization. Add your first hall to start receiving bookings.</p>
                            <Link href="/list-venue">
                                <Button variant="outline" className="rounded-xl px-6">Add Venue</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/50">
                            {organization.halls.map((hall) => (
                                <div key={hall.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 hover:bg-muted/30 transition-colors group">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                            <Building className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-foreground">{hall.name}</h3>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 font-medium">
                                                <MapPin className="w-4 h-4" /> {hall.location_area}
                                            </div>
                                            <div className="flex gap-2 mt-3">
                                                <span className="text-xs px-3 py-1 rounded-full font-semibold bg-secondary/50 text-secondary-foreground border border-secondary">
                                                    Capacity: {hall.capacity}
                                                </span>
                                                <span className="text-xs px-3 py-1 rounded-full font-semibold bg-green-500/10 text-green-600 border border-green-500/20">
                                                    ${hall.price_per_slot}/slot
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <Button variant="outline" size="sm" className="flex-1 sm:flex-none gap-2 rounded-lg border-border/60 hover:bg-muted/50" onClick={() => router.push(`/halls/${hall.id}`)}>
                                            <ChevronRight className="w-4 h-4" /> View
                                        </Button>
                                        <Button variant="outline" size="sm" className="flex-1 sm:flex-none gap-2 rounded-lg border-border/60 hover:bg-muted/50" onClick={() => router.push(`/list-venue?edit=${hall.id}`)}>
                                            <Edit className="w-4 h-4" /> Edit
                                        </Button>
                                        <Button variant="ghost" size="sm" className="flex-1 sm:flex-none gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg">
                                            <Trash2 className="w-4 h-4" /> Delete
                                        </Button>
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
