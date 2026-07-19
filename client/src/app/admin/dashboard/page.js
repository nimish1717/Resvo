'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../../lib/authStore';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Users, Building2, TrendingUp, IndianRupee, ArrowUpRight, ArrowDownRight, ArrowRight, MoreVertical, Search, FileText } from 'lucide-react';

export default function AdminDashboardPage() {
    const user = useAuthStore((state) => state.user);
    const loading = useAuthStore((state) => state.loading);
    const authFetch = useAuthStore((state) => state.authFetch);
    const [halls, setHalls] = useState([]);
    const [stats, setStats] = useState({ users: 12584, organizations: 1204, pendingHalls: 42, bookings: 3250 });
    const [pageError, setPageError] = useState('');
    const [actionLoadingId, setActionLoadingId] = useState(null);

    async function loadData() {
        // Fetch pending halls
        const { response, data } = await authFetch('/admin/halls/pending');
        if (!response.ok) {
            setPageError(data?.message || data?.error || 'Could not load pending halls');
        } else {
            setHalls(data.halls || []);
        }

        // Fetch stats
        const statsRes = await authFetch('/admin/stats');
        if (statsRes.response.ok) {
            setStats(statsRes.data);
        }
    }

    useEffect(() => {
        if (!loading && user?.role === 'SUPER_ADMIN') {
            loadData();
        }
    }, [loading, user]);

    async function handleDecision(hallId, action) {
        setActionLoadingId(hallId);
        const { response, data } = await authFetch(`/admin/halls/${hallId}/${action}`, {
            method: 'POST',
        });
        setActionLoadingId(null);

        if (!response.ok) {
            setPageError(data?.message || data?.error || 'Action failed');
            return;
        }
        setHalls((prev) => prev.filter((hall) => hall.id !== hallId));
    }

    if (loading) return (
        <div className="flex justify-center items-center h-full min-h-[60vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    // If user is not super admin, show the specific Access Denied component within the dashboard area
    if (user?.role !== 'SUPER_ADMIN') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh]">
                <div className="bg-[#1a0e10] p-8 rounded-2xl border border-red-900/40 text-center max-w-md shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>
                    <div className="bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-red-400 mb-2">Access Denied</h2>
                    <p className="text-sm text-red-500/70 font-medium">Super Admin privileges required to view this area.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0c] p-8 font-sans">
            <div className="max-w-[1600px] mx-auto space-y-6">
                
                {/* Top Row: Hero & Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Hero Card */}
                    <div className="lg:col-span-2 rounded-2xl overflow-hidden relative border border-border/50 bg-[#0f1014] p-8 min-h-[220px]">
                        <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none">
                            <img src="https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&q=80&w=1200" alt="Cityscape" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1014] via-[#0f1014]/80 to-transparent pointer-events-none"></div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0] || 'Admin'} <span className="text-2xl">👋</span></h2>
                                <p className="text-sm text-muted-foreground font-medium">Here's what's happening on your platform today.</p>
                            </div>
                            <div className="flex gap-8 mt-8">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Now</span>
                                    <span className="text-sm font-bold ml-1">128 Users</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending Actions</span>
                                    <span className="text-sm font-bold ml-1">{stats?.pendingHalls || 0} Approvals</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stat Cards */}
                    {[
                        { title: 'Total Users', value: stats?.users?.toLocaleString() || '0', icon: Users, trend: '+5.2%', trendUp: true, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                        { title: 'Organizations', value: stats?.organizations?.toLocaleString() || '0', icon: Building2, trend: '+2.1%', trendUp: true, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                        { title: 'Pending Approvals', value: stats?.pendingHalls || '0', icon: ShieldCheck, trend: '-1.0%', trendUp: false, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                        { title: 'Total Bookings', value: stats?.bookings?.toLocaleString() || '0', icon: IndianRupee, trend: '+8.4%', trendUp: true, color: 'text-green-500', bg: 'bg-green-500/10' },
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-[#0f1014] border border-border/50 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`${stat.bg} w-10 h-10 rounded-lg flex items-center justify-center`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                                {idx === 3 && (
                                    <div className="text-[10px] text-muted-foreground font-semibold px-2 py-1 bg-muted/50 rounded border border-border/50 flex items-center gap-1">
                                        Jul 1 - Jul 31, 2026
                                    </div>
                                )}
                            </div>
                            <div className="relative z-10">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.title}</p>
                                <p className="text-3xl font-bold mb-2">{stat.value}</p>
                                <div className={`flex items-center text-xs font-bold ${stat.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                                    {stat.trendUp ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                                    {stat.trend} <span className="text-muted-foreground font-medium ml-1">vs last month</span>
                                </div>
                            </div>
                            {/* Decorative Line Graph Background */}
                            <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-20 pointer-events-none">
                                <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full">
                                    <path d={idx % 2 === 0 ? "M0,50 L0,30 L20,40 L40,20 L60,35 L80,10 L100,20 L100,50 Z" : "M0,50 L0,40 L20,20 L40,30 L60,15 L80,25 L100,5 L100,50 Z"} 
                                          fill={`currentColor`} className={stat.color} />
                                    <polyline points={idx % 2 === 0 ? "0,30 20,40 40,20 60,35 80,10 100,20" : "0,40 20,20 40,30 60,15 80,25 100,5"} 
                                              fill="none" stroke="currentColor" strokeWidth="2" className={stat.color} />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Middle Row: Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Revenue Overview */}
                    <div className="bg-[#0f1014] border border-border/50 rounded-2xl p-6 min-h-[300px] flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Bookings</p>
                                <div className="flex items-end gap-3">
                                    <h3 className="text-2xl font-bold">{stats?.bookings?.toLocaleString() || '0'}</h3>
                                    <span className="text-xs text-green-500 font-bold flex items-center mb-1"><ArrowUpRight className="w-3 h-3 mr-0.5" /> 22.8%</span>
                                </div>
                            </div>
                            <button className="text-xs border border-border/50 bg-muted/30 hover:bg-muted/50 px-3 py-1.5 rounded transition-colors text-muted-foreground font-medium">View Report</button>
                        </div>
                        <div className="flex-1 relative w-full mt-2">
                            {/* CSS Placeholder Chart */}
                            <div className="absolute inset-0 flex items-end">
                                <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full opacity-60">
                                    <defs>
                                        <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#eab308" stopOpacity="0.4" />
                                            <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path d="M0,50 L0,20 L10,25 L20,15 L30,22 L40,10 L50,18 L60,12 L70,20 L80,8 L90,15 L100,10 L100,50 Z" fill="url(#grad1)" />
                                    <polyline points="0,20 10,25 20,15 30,22 40,10 50,18 60,12 70,20 80,8 90,15 100,10" fill="none" stroke="#eab308" strokeWidth="1.5" />
                                    {/* Data Points */}
                                    <circle cx="100" cy="10" r="1.5" fill="#eab308" />
                                </svg>
                            </div>
                            <div className="absolute top-0 right-0 bg-[#0f1014] border border-border/50 text-[10px] px-2 py-1 rounded">
                                <div className="font-bold text-foreground">{stats?.bookings?.toLocaleString() || '0'}</div>
                                <div className="text-muted-foreground">Jul 31</div>
                            </div>
                            <div className="absolute bottom-0 left-0 w-full flex justify-between text-[10px] text-muted-foreground border-t border-border/20 pt-2 px-1">
                                <span>Jul 1</span><span>Jul 8</span><span>Jul 15</span><span>Jul 22</span><span>Jul 31</span>
                            </div>
                            <div className="absolute top-0 left-0 h-full flex flex-col justify-between text-[10px] text-muted-foreground pb-6 pr-2 border-r border-border/20">
                                <span>₹20L</span><span>₹15L</span><span>₹10L</span><span>₹5L</span><span>₹0</span>
                            </div>
                        </div>
                    </div>

                    {/* User Growth */}
                    <div className="bg-[#0f1014] border border-border/50 rounded-2xl p-6 min-h-[300px] flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">User Growth</p>
                                <div className="flex items-end gap-3">
                                    <h3 className="text-2xl font-bold">{stats?.users?.toLocaleString() || '0'}</h3>
                                    <span className="text-xs text-green-500 font-bold flex items-center mb-1"><ArrowUpRight className="w-3 h-3 mr-0.5" /> 5.2%</span>
                                </div>
                            </div>
                            <button className="text-xs border border-border/50 bg-muted/30 hover:bg-muted/50 px-3 py-1.5 rounded transition-colors text-muted-foreground font-medium">View Report</button>
                        </div>
                        <div className="flex-1 relative w-full mt-2">
                            <div className="absolute inset-0 flex items-end">
                                <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full opacity-60">
                                    <defs>
                                        <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                                            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path d="M0,50 L0,30 L10,28 L20,32 L30,20 L40,25 L50,15 L60,22 L70,18 L80,25 L90,12 L100,15 L100,50 Z" fill="url(#grad2)" />
                                    <polyline points="0,30 10,28 20,32 30,20 40,25 50,15 60,22 70,18 80,25 90,12 100,15" fill="none" stroke="#a855f7" strokeWidth="1.5" />
                                    <circle cx="100" cy="15" r="1.5" fill="#a855f7" />
                                </svg>
                            </div>
                            <div className="absolute top-4 right-0 bg-[#0f1014] border border-border/50 text-[10px] px-2 py-1 rounded">
                                <div className="font-bold text-foreground">{stats?.users?.toLocaleString() || '0'}</div>
                                <div className="text-muted-foreground">Jul 31</div>
                            </div>
                            <div className="absolute bottom-0 left-0 w-full flex justify-between text-[10px] text-muted-foreground border-t border-border/20 pt-2 px-1">
                                <span>Jul 1</span><span>Jul 8</span><span>Jul 15</span><span>Jul 22</span><span>Jul 31</span>
                            </div>
                            <div className="absolute top-0 left-0 h-full flex flex-col justify-between text-[10px] text-muted-foreground pb-6 pr-2 border-r border-border/20">
                                <span>20K</span><span>15K</span><span>10K</span><span>5K</span><span>0</span>
                            </div>
                        </div>
                    </div>

                    {/* Booking Trends */}
                    <div className="bg-[#0f1014] border border-border/50 rounded-2xl p-6 min-h-[300px] flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Booking Trends</p>
                                <div className="flex items-end gap-3">
                                    <h3 className="text-2xl font-bold">3,250</h3>
                                    <span className="text-xs text-green-500 font-bold flex items-center mb-1"><ArrowUpRight className="w-3 h-3 mr-0.5" /> 16.4%</span>
                                </div>
                            </div>
                            <button className="text-xs border border-border/50 bg-muted/30 hover:bg-muted/50 px-3 py-1.5 rounded transition-colors text-muted-foreground font-medium">View Report</button>
                        </div>
                        <div className="flex-1 relative w-full mt-2">
                            <div className="absolute inset-0 flex items-end">
                                <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full opacity-60">
                                    <defs>
                                        <linearGradient id="grad3" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path d="M0,50 L0,25 L10,20 L20,30 L30,15 L40,22 L50,10 L60,18 L70,25 L80,12 L90,20 L100,10 L100,50 Z" fill="url(#grad3)" />
                                    <polyline points="0,25 10,20 20,30 30,15 40,22 50,10 60,18 70,25 80,12 90,20 100,10" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
                                    <circle cx="100" cy="10" r="1.5" fill="#3b82f6" />
                                </svg>
                            </div>
                            <div className="absolute top-0 right-0 bg-[#0f1014] border border-border/50 text-[10px] px-2 py-1 rounded">
                                <div className="font-bold text-foreground">3.2K</div>
                                <div className="text-muted-foreground">Jul 31</div>
                            </div>
                            <div className="absolute bottom-0 left-0 w-full flex justify-between text-[10px] text-muted-foreground border-t border-border/20 pt-2 px-1">
                                <span>Jul 1</span><span>Jul 8</span><span>Jul 15</span><span>Jul 22</span><span>Jul 31</span>
                            </div>
                            <div className="absolute top-0 left-0 h-full flex flex-col justify-between text-[10px] text-muted-foreground pb-6 pr-2 border-r border-border/20">
                                <span>5K</span><span>4K</span><span>3K</span><span>2K</span><span>0</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Pending Hall Approvals */}
                    <div className="lg:col-span-1 xl:col-span-1 bg-[#0f1014] border border-border/50 rounded-2xl p-6 relative col-span-1 md:col-span-2 lg:col-span-1 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Pending Hall Approvals</h3>
                            <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[10px] font-bold px-2 py-0.5 rounded">{stats?.pendingHalls || 0} Pending</span>
                        </div>
                        {pageError && <div className="text-xs text-red-500 mb-4">{pageError}</div>}
                        
                        <div className="space-y-4 overflow-y-auto max-h-[300px] scrollbar-hide pr-2">
                            {halls.length === 0 ? (
                                <div className="text-center py-10">
                                    <CheckCircle2 className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                                    <p className="text-sm text-muted-foreground">All caught up!</p>
                                </div>
                            ) : (
                                halls.map((hall) => (
                                    <div key={hall.id} className="flex justify-between items-center gap-4 group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-muted/50 flex-shrink-0 flex items-center justify-center border border-border/50">
                                                <Building2 className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold leading-tight line-clamp-1">{hall.name}</h4>
                                                <p className="text-[10px] text-muted-foreground mt-0.5">{hall.organizations?.name || 'Unknown Org'} - Cap: {hall.capacity}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => handleDecision(hall.id, 'approve')}
                                                disabled={actionLoadingId === hall.id}
                                                className="text-[10px] font-bold px-3 py-1.5 rounded border border-green-500/30 text-green-500 hover:bg-green-500/10 transition-colors"
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => handleDecision(hall.id, 'reject')}
                                                disabled={actionLoadingId === hall.id}
                                                className="text-[10px] font-bold px-3 py-1.5 rounded border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors"
                                            >
                                                Reject
                                            </button>
                                            <button className="text-muted-foreground hover:text-foreground p-1">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-[#0f1014] border border-border/50 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Recent Activity</h3>
                            <button className="text-[10px] border border-border/50 bg-muted/30 hover:bg-muted/50 px-2 py-1 rounded transition-colors text-muted-foreground font-medium">View All</button>
                        </div>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="mt-1"><div className="w-6 h-6 rounded bg-green-500/10 border border-green-500/20 flex items-center justify-center"><CheckCircle2 className="w-3 h-3 text-green-500" /></div></div>
                                <div>
                                    <p className="text-sm font-medium">New organization "ABC Events" has been registered</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">2 mins ago</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1"><div className="w-6 h-6 rounded bg-green-500/10 border border-green-500/20 flex items-center justify-center"><CheckCircle2 className="w-3 h-3 text-green-500" /></div></div>
                                <div>
                                    <p className="text-sm font-medium">Hall "The Ivory Hall" has been approved</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">15 mins ago</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1"><div className="w-6 h-6 rounded bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center"><AlertTriangle className="w-3 h-3 text-yellow-500" /></div></div>
                                <div>
                                    <p className="text-sm font-medium">User "rahul123" reported a venue</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">1 hour ago</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1"><div className="w-6 h-6 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center"><XCircle className="w-3 h-3 text-red-500" /></div></div>
                                <div>
                                    <p className="text-sm font-medium">Organization "Dream Celebrations" suspended</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">2 hours ago</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1"><div className="w-6 h-6 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center"><FileText className="w-3 h-3 text-blue-500" /></div></div>
                                <div>
                                    <p className="text-sm font-medium">New hall "Ocean View Resort" submitted for approval</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">3 hours ago</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Platform Health */}
                    <div className="bg-[#0f1014] border border-border/50 rounded-2xl p-6 flex flex-col justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6">Platform Health</h3>
                            <div className="space-y-5">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium">API Uptime</span>
                                        <span className="text-xs text-green-500 font-bold">99.9%</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-1"><div className="bg-green-500 h-1 rounded-full" style={{width: '99.9%'}}></div></div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium">Database</span>
                                        <span className="text-xs text-green-500 font-bold">Healthy</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-1"><div className="bg-green-500 h-1 rounded-full" style={{width: '100%'}}></div></div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium">Server Load</span>
                                        <span className="text-xs text-green-500 font-bold">24%</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-1"><div className="bg-green-500 h-1 rounded-full" style={{width: '24%'}}></div></div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium">Storage</span>
                                        <span className="text-xs text-yellow-500 font-bold">68%</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-1"><div className="bg-yellow-500 h-1 rounded-full" style={{width: '68%'}}></div></div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium">CDN</span>
                                        <span className="text-xs text-green-500 font-bold">Healthy</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-1"><div className="bg-green-500 h-1 rounded-full" style={{width: '100%'}}></div></div>
                                </div>
                            </div>
                        </div>
                        <button className="w-full mt-6 py-3 border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors text-xs font-bold text-muted-foreground rounded-lg flex items-center justify-center gap-2">
                            View System Status <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}