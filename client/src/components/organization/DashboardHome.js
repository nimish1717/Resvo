'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../../app/lib/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/Card';
import { Building2, Calendar as CalendarIcon, Clock, DollarSign, Activity, Plus, CheckCircle, BarChart3 } from 'lucide-react';
import { Button } from '../../app/components/ui/Button';
import Link from 'next/link';

export default function DashboardHome() {
    const authFetch = useAuthStore((state) => state.authFetch);
    const user = useAuthStore((state) => state.user);
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [orgName, setOrgName] = useState('Your Organization');

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const [statsRes, activitiesRes, orgRes] = await Promise.all([
                    authFetch('/stats/organization/overview'),
                    authFetch('/organizations/mine/activities?limit=5'),
                    authFetch('/organizations/mine')
                ]);
                
                if (statsRes.response.ok) setStats(statsRes.data);
                if (activitiesRes.response.ok) setActivities(activitiesRes.data.activities);
                if (orgRes.response.ok && orgRes.data.organization) setOrgName(orgRes.data.organization.name);
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            }
            setLoading(false);
        }
        loadData();
    }, [authFetch]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[80vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-6 lg:p-8 pb-20">
            {/* Header */}
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <h1 className="text-3xl font-serif font-bold text-foreground">Welcome back, {user?.name} 👋</h1>
                <p className="text-muted-foreground mt-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> 
                    {orgName} <span className="text-primary font-medium opacity-80">• Verified Organizer</span>
                </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="shadow-sm border-border bg-card hover:border-primary/20 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Revenue Today</CardTitle>
                        <div className="p-2 bg-green-500/10 rounded-full">
                            <DollarSign className="w-4 h-4 text-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">${(stats?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        <p className="text-xs text-muted-foreground mt-1">Monthly: ${(stats?.monthlyRevenue || 0).toLocaleString()}</p>
                    </CardContent>
                </Card>
                
                <Card className="shadow-sm border-border bg-card hover:border-primary/20 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Bookings Today</CardTitle>
                        <div className="p-2 bg-primary/10 rounded-full">
                            <CalendarIcon className="w-4 h-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{stats?.activeBookings || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Active bookings</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-border bg-card hover:border-primary/20 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Events</CardTitle>
                        <div className="p-2 bg-blue-500/10 rounded-full">
                            <Activity className="w-4 h-4 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{stats?.halls || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total Halls</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-border bg-card hover:border-primary/20 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
                        <div className="p-2 bg-yellow-500/10 rounded-full">
                            <Clock className="w-4 h-4 text-yellow-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{stats?.pendingBookings || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Awaiting your response</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-4">
                    <Link href="/organization/halls">
                        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-6 h-12 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all">
                            <Plus className="w-4 h-4" /> Add Hall
                        </Button>
                    </Link>
                    <Link href="/organization/bookings">
                        <Button variant="outline" className="gap-2 rounded-xl px-6 h-12 border-border/60 hover:bg-muted/50 transition-all">
                            <CalendarIcon className="w-4 h-4" /> View Calendar
                        </Button>
                    </Link>
                    <Link href="/organization/bookings">
                        <Button variant="outline" className="gap-2 rounded-xl px-6 h-12 border-border/60 hover:bg-muted/50 transition-all">
                            <CheckCircle className="w-4 h-4" /> Approve Requests
                        </Button>
                    </Link>
                    <Link href="/organization/analytics">
                        <Button variant="outline" className="gap-2 rounded-xl px-6 h-12 border-border/60 hover:bg-muted/50 transition-all">
                            <BarChart3 className="w-4 h-4" /> View Analytics
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pt-4">
                {/* Left Column */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Pending Requests */}
                    <Card className="border-border shadow-sm bg-card rounded-2xl overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b border-border/50">
                            <CardTitle className="text-lg">Pending Requests</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="p-6 space-y-4">
                                {stats?.pendingBookings > 0 ? (
                                    <div className="flex items-center justify-between p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-yellow-500/20 rounded-full">
                                                <Clock className="w-4 h-4 text-yellow-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">You have {stats.pendingBookings} pending requests.</p>
                                                <p className="text-sm text-muted-foreground">Review them to secure your bookings.</p>
                                            </div>
                                        </div>
                                        <Link href="/organization/bookings">
                                            <Button size="sm" variant="outline" className="rounded-full">Manage</Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground py-8 text-center bg-muted/20 rounded-xl border border-dashed border-border">
                                        <CalendarIcon className="w-8 h-8 mx-auto text-muted-foreground/40 mb-3" />
                                        No pending requests at the moment.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    {/* Recent Activity */}
                    <Card className="border-border shadow-sm bg-card rounded-2xl overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b border-border/50">
                            <CardTitle className="text-lg">Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                {activities.length > 0 ? activities.map((act, i) => (
                                    <div key={act.id} className="relative pl-6">
                                        {/* Timeline line */}
                                        {i !== activities.length - 1 && (
                                            <div className="absolute left-[9px] top-6 bottom-[-24px] w-[2px] bg-border/50"></div>
                                        )}
                                        {/* Timeline dot */}
                                        <div className="absolute left-0 top-1.5 w-[20px] h-[20px] rounded-full bg-background border-2 border-primary flex items-center justify-center">
                                            <div className="w-[8px] h-[8px] rounded-full bg-primary"></div>
                                        </div>
                                        
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-foreground">{act.action}</span>
                                            <span className="text-xs text-muted-foreground mt-0.5">{act.details}</span>
                                            <span className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-wider">{new Date(act.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-sm text-muted-foreground text-center py-4">No recent activity.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
