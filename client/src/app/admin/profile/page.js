'use client';
import { useAuthStore } from '../../lib/authStore';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const user = useAuthStore(state => state.user);
  const authFetch = useAuthStore(state => state.authFetch);
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState({ bookings: 0, spent: 0 });
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    async function fetchProfileData() {
        if (!user) return;
        try {
            const bookRes = await authFetch('/bookings');
            let totalBookings = 0;
            let totalSpent = 0;
            if (bookRes.response?.ok && bookRes.data?.bookings) {
                totalBookings = bookRes.data.bookings.length;
                totalSpent = bookRes.data.bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
            }
            setStats({ bookings: totalBookings, spent: totalSpent });

        } catch (error) {
            console.error("Failed to fetch profile data:", error);
        }
    }
    fetchProfileData();
  }, [authFetch, user]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-12 p-8 font-sans">
      
      <div className="bg-card border border-border rounded-3xl overflow-hidden max-w-6xl flex flex-col md:flex-row">
        
        {/* Left Panel: Profile Info */}
        <div className="md:w-1/3 p-8 border-r border-border flex flex-col items-center text-center">
          <div className="w-32 h-32 rounded-full bg-background border border-border flex items-center justify-center text-4xl font-light mb-6">
            {user?.name?.charAt(0) || 'N'}
          </div>
          <h2 className="text-2xl font-semibold mb-2">{user?.name || 'User'}</h2>
          <p className="text-sm text-muted-foreground mb-1">{user?.email || 'user@example.com'}</p>
          <p className="text-sm text-muted-foreground mb-8">{user?.phone || '+91 98765 43210'}</p>
          <button className="w-full py-3 bg-muted/50 hover:bg-muted text-foreground rounded-xl transition-colors font-medium border border-border">
            Edit Profile
          </button>
        </div>
        
        {/* Right Panel: Content */}
        <div className="md:w-2/3 p-8">
          {/* Tabs */}
          <div className="flex gap-8 border-b border-border mb-8 overflow-x-auto scrollbar-hide">
            {['Overview', 'Bookings', 'Saved', 'Reviews', 'Settings'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-medium transition-colors relative whitespace-nowrap ${
                  activeTab === tab ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'Overview' && (
            <div className="flex flex-col md:flex-row gap-8">
              {/* Stats */}
              <div className="md:w-1/3">
                <h3 className="text-lg font-semibold mb-6">Your Stats</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Bookings</p>
                    <p className="text-2xl font-semibold text-primary">{stats.bookings}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                    <p className="text-2xl font-semibold flex items-center gap-2">
                       ₹{stats.spent.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Member Since</p>
                    <p className="text-lg font-medium">Jan 2024</p>
                  </div>
                </div>
              </div>

              {/* Favorite Venues */}
              <div className="md:w-2/3">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Favorite Venues</h3>
                  <Link href="/dashboard/saved" className="text-sm text-primary hover:underline">View all</Link>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.length > 0 ? favorites.map((hall, idx) => (
                    <Link href={`/halls/${hall.id}`} key={idx} className="block group">
                      <div className="rounded-xl overflow-hidden border border-border mb-3 relative aspect-[4/3]">
                        <img 
                          src={hall.photos?.[0] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800'} 
                          alt={hall.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="flex items-center gap-1 text-primary text-sm font-medium mb-1">
                        ★ 4.8
                      </div>
                      <h4 className="text-sm font-medium line-clamp-1">{hall.name}</h4>
                    </Link>
                  )) : (
                     <div className="col-span-3 text-sm text-muted-foreground">No favorite venues yet.</div>
                  )}
                  {favorites.length === 0 && (
                    <>
                    <div className="block group">
                      <div className="rounded-xl overflow-hidden border border-border mb-3 relative aspect-[4/3]">
                        <div className="w-full h-full bg-slate-800"></div>
                      </div>
                      <div className="flex items-center gap-1 text-primary text-sm font-medium mb-1">★ 4.8</div>
                      <h4 className="text-sm font-medium line-clamp-1">The Obsidian Loft</h4>
                    </div>
                    <div className="block group">
                      <div className="rounded-xl overflow-hidden border border-border mb-3 relative aspect-[4/3]">
                        <div className="w-full h-full bg-slate-800"></div>
                      </div>
                      <div className="flex items-center gap-1 text-primary text-sm font-medium mb-1">★ 4.7</div>
                      <h4 className="text-sm font-medium line-clamp-1">The Garden Pavilion</h4>
                    </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          {activeTab !== 'Overview' && (
            <div className="text-muted-foreground text-sm">
                This section is currently under development.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}