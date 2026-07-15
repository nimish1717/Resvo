'use client';

import { useState } from 'react';
import { useAuthStore } from '../lib/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Building2, MapPin, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ListVenuePage() {
    const authFetch = useAuthStore((state) => state.authFetch);
    const user = useAuthStore((state) => state.user);

    const [orgName, setOrgName] = useState('');
    const [orgResult, setOrgResult] = useState(null);
    const [orgError, setOrgError] = useState('');
    const [orgSubmitting, setOrgSubmitting] = useState(false);

    const [hallForm, setHallForm] = useState({
        name: '', locationArea: '', capacity: '', venueTier: 'standard', pricePerSlot: '', photos: null,
    });
    const [hallResult, setHallResult] = useState(null);
    const [hallError, setHallError] = useState('');
    const [hallSubmitting, setHallSubmitting] = useState(false);

    async function handleOrgSubmit(e) {
        e.preventDefault();
        setOrgError('');
        setOrgSubmitting(true);

        const { response, data } = await authFetch('/organizations', {
            method: 'POST',
            body: JSON.stringify({ name: orgName }),
        });

        setOrgSubmitting(false);

        if (!response.ok) {
            setOrgError(data?.message || data?.error || 'Something went wrong');
            return;
        }
        setOrgResult(data.organization);
    }

    async function handleHallSubmit(e) {
        e.preventDefault();
        setHallError('');
        setHallSubmitting(true);

        if (!hallForm.photos || hallForm.photos.length === 0) {
            setHallError('At least 1 photo is required');
            setHallSubmitting(false);
            return;
        }

        const formData = new FormData();
        formData.append('organizationId', orgResult.id);
        formData.append('name', hallForm.name);
        formData.append('locationArea', hallForm.locationArea);
        formData.append('capacity', hallForm.capacity);
        formData.append('venueTier', hallForm.venueTier);
        formData.append('pricePerSlot', hallForm.pricePerSlot);

        for (let i = 0; i < hallForm.photos.length; i++) {
            formData.append('photos', hallForm.photos[i]);
        }

        const { response, data } = await authFetch('/halls', {
            method: 'POST',
            body: formData,
            isFormData: true,
        });

        setHallSubmitting(false);

        if (!response.ok) {
            setHallError(data?.message || data?.error || 'Something went wrong');
            return;
        }
        setHallResult(data.hall);
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-xl border border-red-200 dark:border-red-900/50 text-center max-w-sm">
                    <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Access Denied</h2>
                    <p className="text-red-600 dark:text-red-300 mb-4">Please log in to list a venue.</p>
                    <Link href="/login">
                        <Button variant="outline" className="border-red-200 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/50 w-full">Log in</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">List your venue</h1>
                    <p className="text-muted-foreground">Partner with Resvo to reach thousands of event planners.</p>
                </div>

                {/* Step 1: create the organization */}
                <Card className={orgResult ? 'opacity-70 grayscale pointer-events-none transition-all' : 'shadow-lg border-primary/20'}>
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center font-bold">1</div>
                            <CardTitle>Business Details</CardTitle>
                        </div>
                        <CardDescription>Submit your business for review. A Super Admin approves it before your halls become publicly visible.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!orgResult ? (
                            <form onSubmit={handleOrgSubmit} className="flex flex-col gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-foreground">Organization / Business Name</label>
                                    <Input
                                        type="text"
                                        placeholder="E.g., The Grand Hotels Group"
                                        value={orgName}
                                        onChange={(e) => setOrgName(e.target.value)}
                                        required
                                    />
                                </div>
                                {orgError && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 p-2 rounded border border-red-100 dark:border-red-900/50">{orgError}</p>}
                                <Button type="submit" disabled={orgSubmitting} className="w-full sm:w-auto self-start mt-2">
                                    {orgSubmitting ? 'Submitting...' : 'Submit for review'}
                                </Button>
                            </form>
                        ) : (
                            <div className="flex items-start gap-3 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-900/50">
                                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold">"{orgResult.name}" submitted successfully</p>
                                    <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                                        Status: <span className="font-mono uppercase font-bold">{orgResult.status}</span>. You can proceed to add halls now.
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Step 2: add a hall under it, once the org exists */}
                {orgResult && (
                    <Card className="shadow-lg border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <CardHeader>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center font-bold">2</div>
                                <CardTitle>Venue Details</CardTitle>
                            </div>
                            <CardDescription>Add a specific hall or space under your organization.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!hallResult ? (
                                <form onSubmit={handleHallSubmit} className="flex flex-col gap-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-foreground">Hall Name</label>
                                            <Input
                                                type="text" placeholder="E.g., The Obsidian Loft" required
                                                value={hallForm.name}
                                                onChange={(e) => setHallForm({ ...hallForm, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-foreground">Location / Area</label>
                                            <Input
                                                type="text" placeholder="E.g., Lower Parel, Mumbai" required
                                                value={hallForm.locationArea}
                                                onChange={(e) => setHallForm({ ...hallForm, locationArea: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-foreground">Capacity (Guests)</label>
                                            <Input
                                                type="number" placeholder="E.g., 400" required
                                                value={hallForm.capacity}
                                                onChange={(e) => setHallForm({ ...hallForm, capacity: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-foreground">Venue Tier</label>
                                            <select
                                                value={hallForm.venueTier}
                                                onChange={(e) => setHallForm({ ...hallForm, venueTier: e.target.value })}
                                                className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            >
                                                <option value="budget">Budget</option>
                                                <option value="standard">Standard</option>
                                                <option value="premium">Premium</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-foreground">Price per slot (₹)</label>
                                            <Input
                                                type="number" placeholder="E.g., 50000" required
                                                value={hallForm.pricePerSlot}
                                                onChange={(e) => setHallForm({ ...hallForm, pricePerSlot: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-foreground">Venue Photos</label>
                                            <Input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                required
                                                onChange={(e) => setHallForm({ ...hallForm, photos: e.target.files })}
                                                className="pt-1.5 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                    
                                    {hallError && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 p-2 rounded border border-red-100 dark:border-red-900/50 mt-2">{hallError}</p>}
                                    
                                    <Button type="submit" disabled={hallSubmitting} size="lg" className="mt-4 w-full md:w-auto self-end">
                                        {hallSubmitting ? 'Adding Venue...' : 'Add Venue to Organization'}
                                    </Button>
                                </form>
                            ) : (
                                <div className="flex items-start gap-3 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-900/50">
                                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold">"{hallResult.name}" successfully added</p>
                                        <p className="text-sm text-green-600 dark:text-green-500 mt-1 mb-3">
                                            Your venue is now pending organization approval.
                                        </p>
                                        <Link href="/dashboard/organizations">
                                            <Button variant="outline" className="border-green-200 hover:bg-green-100 dark:border-green-800 dark:hover:bg-green-900/50 text-green-800 dark:text-green-300">
                                                Go to Dashboard
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}