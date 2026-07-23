'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../../app/lib/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../app/components/ui/Card';
import { BarChart3, TrendingUp, PieChart, Users, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

export default function Analytics({ organization }) {
    const authFetch = useAuthStore((state) => state.authFetch);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [orgStatus, setOrgStatus] = useState(organization?.status || 'pending');

    useEffect(() => {
        async function loadAnalytics() {
            setLoading(true);
            
            if (!organization) {
                // Fetch organization status if not passed
                const { response: orgRes, data: orgData } = await authFetch('/organizations/mine');
                if (orgRes.ok && orgData.organization) {
                    setOrgStatus(orgData.organization.status);
                    if (orgData.organization.status !== 'approved') {
                        setLoading(false);
                        return;
                    }
                }
            } else if (organization.status !== 'approved') {
                setLoading(false);
                return;
            }

            const { response, data } = await authFetch('/stats/organization/analytics');
            if (response.ok) {
                setAnalytics(data);
            }
            setLoading(false);
        }
        
        loadAnalytics();
    }, [authFetch, organization]);

    if (orgStatus !== 'approved') {
        return (
            <div className="max-w-6xl mx-auto p-6 lg:p-8">
                <Card className="bg-yellow-500/10 border-yellow-500/20 rounded-2xl">
                    <CardContent className="p-8 flex items-start gap-4">
                        <div className="p-3 bg-yellow-500/20 rounded-full">
                            <Activity className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-yellow-600 dark:text-yellow-500">Analytics Unavailable</h3>
                            <p className="text-sm text-yellow-700/80 dark:text-yellow-400/80 mt-1">
                                Analytics will be available once your organization is approved and you start receiving bookings.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[80vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const maxBookings = Math.max(...(analytics?.popularHalls?.map(h => h.bookings) || [1]));

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-6 lg:p-8 pb-20">
            {/* Header */}
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
                    <BarChart3 className="w-8 h-8 text-primary" /> Performance Analytics
                </h1>
                <p className="text-muted-foreground mt-2">
                    Deep dive into your business metrics and discover actionable insights.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Popular Halls */}
                <Card className="shadow-sm border-border bg-card rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="bg-muted/30 border-b border-border/50 p-6">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" /> Most Popular Halls
                        </CardTitle>
                        <CardDescription>Based on total number of bookings</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        {!analytics?.popularHalls || analytics.popularHalls.length === 0 ? (
                            <div className="text-center text-muted-foreground py-12 text-sm bg-muted/20 rounded-xl border border-dashed border-border">
                                <TrendingUp className="w-8 h-8 mx-auto text-muted-foreground/40 mb-3" />
                                Not enough data to show popular halls yet.
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {analytics.popularHalls.map((hall, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex justify-between text-sm font-medium">
                                            <span className="text-foreground font-semibold">{hall.name}</span>
                                            <span className="text-muted-foreground">{hall.bookings} bookings</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden flex">
                                            <div 
                                                className="bg-primary h-full rounded-full transition-all duration-1000 ease-out relative" 
                                                style={{ width: `${(hall.bookings / maxBookings) * 100}%` }}
                                            >
                                                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Occupancy Overview Placeholder */}
                <Card className="shadow-sm border-border bg-card rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="bg-muted/30 border-b border-border/50 p-6">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-primary" /> Occupancy Overview
                        </CardTitle>
                        <CardDescription>Visualizing venue utilization</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-12 px-6">
                        <div className="relative w-48 h-48 rounded-full border-[24px] border-primary/10 flex items-center justify-center shadow-inner">
                            <div className="absolute inset-0 border-[24px] border-primary rounded-full shadow-lg" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 0 70%)' }}></div>
                            <div className="text-center z-10 bg-card rounded-full w-24 h-24 flex flex-col items-center justify-center shadow-sm">
                                <span className="text-3xl font-bold text-foreground">70%</span>
                                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Avg</span>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-8 text-center max-w-sm">
                            This visualization demonstrates occupancy rates. Once sufficient historical data is collected, detailed monthly trends will appear here.
                        </p>
                    </CardContent>
                </Card>

                {/* Additional Insights (Mocked) */}
                <Card className="shadow-sm border-border bg-card rounded-2xl overflow-hidden hover:shadow-md transition-shadow lg:col-span-2">
                    <CardHeader className="bg-muted/30 border-b border-border/50 p-6">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" /> Customer Insights
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 bg-muted/30 rounded-xl border border-border/50">
                                <p className="text-sm font-medium text-muted-foreground mb-2">Repeat Customers</p>
                                <div className="flex items-end gap-3">
                                    <span className="text-3xl font-bold">12%</span>
                                    <span className="flex items-center text-sm font-medium text-green-500 mb-1">
                                        <ArrowUpRight className="w-4 h-4 mr-1" /> 2.4%
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 bg-muted/30 rounded-xl border border-border/50">
                                <p className="text-sm font-medium text-muted-foreground mb-2">Average Booking Value</p>
                                <div className="flex items-end gap-3">
                                    <span className="text-3xl font-bold">$1,250</span>
                                    <span className="flex items-center text-sm font-medium text-green-500 mb-1">
                                        <ArrowUpRight className="w-4 h-4 mr-1" /> 8.1%
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 bg-muted/30 rounded-xl border border-border/50">
                                <p className="text-sm font-medium text-muted-foreground mb-2">Cancellation Rate</p>
                                <div className="flex items-end gap-3">
                                    <span className="text-3xl font-bold">4.2%</span>
                                    <span className="flex items-center text-sm font-medium text-red-500 mb-1">
                                        <ArrowUpRight className="w-4 h-4 mr-1" /> 0.5%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
