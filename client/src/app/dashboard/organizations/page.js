'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '../../lib/authStore';
import { CheckCircle2, PlusCircle, Link as LinkIcon, ArrowRight, ArrowLeft, Building, Users2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../../components/ui/Button';

export default function OrganizationsPage() {
    const authFetch = useAuthStore((state) => state.authFetch);
    const user = useAuthStore((state) => state.user);
    const initAuth = useAuthStore((state) => state.initAuth);

    const [mode, setMode] = useState('manage'); // 'manage', 'join', or 'create'
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);

    const [inviteCode, setInviteCode] = useState('');
    const [orgName, setOrgName] = useState('');
    
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function fetchMyOrgs() {
            if (!user) return;
            try {
                const { response, data } = await authFetch('/organizations/mine');
                if (response.ok) {
                    setOrganizations(data.organizations || []);
                }
            } catch (error) {
                console.error("Failed to fetch organizations:", error);
            } finally {
                setLoading(false);
            }
        }
        if (mode === 'manage') {
            fetchMyOrgs();
        }
    }, [authFetch, user, mode]);

    async function handleJoinSubmit(e) {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        const { response, data } = await authFetch('/organizations/join', {
            method: 'POST',
            body: JSON.stringify({ inviteCode }),
        });

        setSubmitting(false);

        if (!response.ok) {
            setError(data?.message || data?.error || 'Something went wrong');
            return;
        }
        setResult(data.request);
    }

    async function handleCreateSubmit(e) {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        const { response, data } = await authFetch('/organizations', {
            method: 'POST',
            body: JSON.stringify({ name: orgName }),
        });

        setSubmitting(false);

        if (!response.ok) {
            setError(data?.message || data?.error || 'Something went wrong');
            return;
        }
        setResult(data.organization);
        await initAuth();
    }

    if (!user) {
        return <p className="p-8 text-red-400">Please log in to manage organizations.</p>;
    }

    return (
        <div className="min-h-screen bg-background text-foreground pb-12 p-8 font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4 border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-semibold mb-2">Organizations</h1>
                    <p className="text-muted-foreground">Manage your properties or join an existing team.</p>
                </div>
                <div className="flex gap-3">
                    <Button 
                        variant={mode === 'join' ? 'default' : 'outline'} 
                        className={`gap-2 ${mode === 'join' ? 'bg-primary text-black' : 'border-border'}`}
                        onClick={() => { setMode('join'); setResult(null); setError(''); }}
                    >
                        <LinkIcon className="w-4 h-4" /> Join Team
                    </Button>
                    <Button 
                        variant={mode === 'create' ? 'default' : 'outline'} 
                        className={`gap-2 ${mode === 'create' ? 'bg-primary text-black' : 'border-border'}`}
                        onClick={() => { setMode('create'); setResult(null); setError(''); }}
                    >
                        <PlusCircle className="w-4 h-4" /> Create Organization
                    </Button>
                </div>
            </div>

            <div className="max-w-4xl">
                {mode === 'manage' && (
                    <div>
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><Building className="w-5 h-5 text-primary" /> My Organizations</h2>
                        {loading ? (
                            <div className="space-y-4">
                                <div className="h-24 bg-card rounded-xl animate-pulse"></div>
                                <div className="h-24 bg-card rounded-xl animate-pulse"></div>
                            </div>
                        ) : organizations.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {organizations.map(org => (
                                    <div key={org.id} className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">{org.name}</h3>
                                                <span className="inline-block bg-primary/10 text-primary border border-primary/20 text-xs px-2 py-0.5 rounded capitalize">
                                                    {org.myRole.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                                <Building className="w-5 h-5" />
                                            </div>
                                        </div>
                                        <Link href="/organization/dashboard" className="mt-4 flex items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground">
                                            Manage Organization <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-card border border-border rounded-xl p-12 text-center flex flex-col items-center">
                                <Building className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                                <h3 className="text-lg font-medium mb-2">No organizations yet</h3>
                                <p className="text-muted-foreground mb-6 max-w-sm">Create a new organization to list your venues, or join an existing one using an invite code.</p>
                                <div className="flex gap-4">
                                    <Button onClick={() => setMode('create')} className="bg-primary text-black hover:bg-primary/90">Create Organization</Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {mode === 'join' && (
                    <div className="bg-card border border-border rounded-xl p-8 max-w-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <Button variant="ghost" size="icon" onClick={() => setMode('manage')} className="w-8 h-8 rounded-full border border-border"><ArrowLeft className="w-4 h-4" /></Button>
                            <h2 className="text-xl font-semibold">Join Organization</h2>
                        </div>
                        {result ? (
                            <div className="bg-green-950/30 p-6 rounded-xl border border-green-900/50 text-center">
                                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                <h3 className="font-semibold text-green-400 mb-1">Join Request Submitted</h3>
                                <p className="text-sm text-green-500 mb-6">
                                    Status: <strong className="uppercase">{result.status}</strong> — waiting on the Organization Admin's approval.
                                </p>
                                <Button onClick={() => setMode('manage')} className="w-full bg-green-600 hover:bg-green-700 text-white border-none">
                                    Back to Organizations
                                </Button>
                            </div>
                        ) : (
                            <div>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Enter the invite code an Organization Admin shared with you. Your request will need
                                    their approval before you become a Co-Admin.
                                </p>
                                <form onSubmit={handleJoinSubmit} className="flex flex-col gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Invite Code</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. RESVO-1234"
                                            value={inviteCode}
                                            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                            required
                                            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary transition-colors"
                                        />
                                    </div>
                                    {error && <p className="text-sm text-red-400 font-medium bg-red-950/30 p-3 rounded border border-red-900/50">{error}</p>}
                                    <Button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 rounded-lg mt-2"
                                    >
                                        {submitting ? 'Submitting...' : 'Submit join request'}
                                    </Button>
                                </form>
                            </div>
                        )}
                    </div>
                )}

                {mode === 'create' && (
                    <div className="bg-card border border-border rounded-xl p-8 max-w-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <Button variant="ghost" size="icon" onClick={() => setMode('manage')} className="w-8 h-8 rounded-full border border-border"><ArrowLeft className="w-4 h-4" /></Button>
                            <h2 className="text-xl font-semibold">Create Organization</h2>
                        </div>
                        {result ? (
                            <div className="bg-green-950/30 p-6 rounded-xl border border-green-900/50 text-center">
                                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                <h3 className="font-semibold text-green-400 mb-1">"{result.name}" created successfully</h3>
                                <p className="text-sm text-green-500 mb-6">
                                    Status: <strong className="uppercase">{result.status}</strong>
                                </p>
                                <Button onClick={() => setMode('manage')} className="w-full bg-green-600 hover:bg-green-700 text-white border-none">
                                    Manage Organizations
                                </Button>
                            </div>
                        ) : (
                            <div>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Create a new organization to list and manage your own premium venues.
                                </p>
                                <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Organization Name</label>
                                        <input
                                            type="text"
                                            placeholder="The Grand Hotels Inc."
                                            value={orgName}
                                            onChange={(e) => setOrgName(e.target.value)}
                                            required
                                            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                                        />
                                    </div>
                                    {error && <p className="text-sm text-red-400 font-medium bg-red-950/30 p-3 rounded border border-red-900/50">{error}</p>}
                                    <Button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 rounded-lg mt-2"
                                    >
                                        {submitting ? 'Creating...' : 'Create organization'}
                                    </Button>
                                </form>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
// Required imports fix below: I'll add ArrowLeft at the top.
