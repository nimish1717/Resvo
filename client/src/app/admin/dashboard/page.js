'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../../lib/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Search, Building2 } from 'lucide-react';

export default function AdminDashboardPage() {
    const user = useAuthStore((state) => state.user);
    const loading = useAuthStore((state) => state.loading);
    const authFetch = useAuthStore((state) => state.authFetch);

    const [organizations, setOrganizations] = useState([]);
    const [pageError, setPageError] = useState('');
    const [actionLoadingId, setActionLoadingId] = useState(null);

    async function loadPending() {
        const { response, data } = await authFetch('/organizations/pending');
        if (!response.ok) {
            setPageError(data?.message || data?.error || 'Could not load pending organizations');
            return;
        }
        setOrganizations(data.organizations || []);
    }

    useEffect(() => {
        if (!loading && user?.isSuperAdmin) {
            loadPending();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, user]);

    async function handleDecision(orgId, action) {
        setActionLoadingId(orgId);
        const { response, data } = await authFetch(`/organizations/${orgId}/${action}`, {
            method: 'POST',
        });
        setActionLoadingId(null);

        if (!response.ok) {
            setPageError(data?.message || data?.error || 'Action failed');
            return;
        }
        // Remove it from the pending list immediately rather than
        // waiting for a full reload.
        setOrganizations((prev) => prev.filter((org) => org.id !== orgId));
    }

    if (loading) return (
        <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    if (!user?.isSuperAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-xl border border-red-200 dark:border-red-900/50 text-center max-w-sm">
                    <ShieldCheck className="w-12 h-12 text-red-500 mx-auto mb-4 opacity-80" />
                    <p className="text-red-600 dark:text-red-300 font-medium">Access Denied</p>
                    <p className="text-sm text-red-500/80 mt-1">Super Admin privileges required to view this area.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Super Admin Dashboard</h1>
                    <p className="text-muted-foreground">Review and moderate organization requests.</p>
                </div>

                {pageError && <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 border border-red-200 dark:border-red-900/50 rounded-xl text-sm font-medium">{pageError}</div>}

                <Card className="shadow-lg border-border">
                    <CardHeader className="bg-muted/30 border-b border-border pb-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-primary" /> Pending Organizations
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    {organizations.length} {organizations.length === 1 ? 'organization requires' : 'organizations require'} your approval
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                        {organizations.length === 0 ? (
                            <div className="p-12 text-center flex flex-col items-center">
                                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-bold">All caught up!</h3>
                                <p className="text-muted-foreground">There are no pending organization requests to review right now.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {organizations.map((org) => (
                                    <div key={org.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-muted/5 transition-colors">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-muted w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                                                <Building2 className="w-6 h-6 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold">{org.name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md">ID: {org.id.substring(0,8)}...</p>
                                                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
                                                        Pending Review
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2 w-full md:w-auto">
                                            <Button
                                                onClick={() => handleDecision(org.id, 'approve')}
                                                disabled={actionLoadingId === org.id}
                                                className="bg-green-600 hover:bg-green-700 text-white gap-2 flex-1 md:flex-none"
                                            >
                                                <CheckCircle2 className="w-4 h-4" /> Approve
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => handleDecision(org.id, 'request-changes')}
                                                disabled={actionLoadingId === org.id}
                                                className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950/30 gap-2 flex-1 md:flex-none"
                                            >
                                                <AlertTriangle className="w-4 h-4" /> Request Changes
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => handleDecision(org.id, 'reject')}
                                                disabled={actionLoadingId === org.id}
                                                className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 gap-2 flex-1 md:flex-none"
                                            >
                                                <XCircle className="w-4 h-4" /> Reject
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}