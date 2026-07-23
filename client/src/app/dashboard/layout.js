'use client';
import { useAuthStore } from '../lib/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Compass, CalendarDays, User, PlusCircle, LogOut } from 'lucide-react';

export default function Layout({ children }) {
  const user = useAuthStore(state => state.user);
  const loading = useAuthStore(state => state.loading);
  const logout = useAuthStore(state => state.logout);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  if (loading || !user) return (
      <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
  );

  const getLinkClass = (path) => {
    const isActive = pathname === path || (path !== '/dashboard' && pathname.startsWith(path));
    return `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-300 relative ${
      isActive 
      ? 'text-primary bg-primary/5 before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-primary' 
      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
    }`;
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      
      {/* Sleek Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col relative z-20">
        <div className="p-6 pb-4">
          <Link href="/" className="text-3xl font-serif font-bold tracking-tight text-[#E2C391] hover:opacity-90 transition-opacity block">
            Resvo
          </Link>
        </div>

        <div className="px-4 pb-4">
            <div className="bg-muted/30 p-1 rounded-lg flex border border-border/50">
               <Link href="/dashboard" className="flex-1 text-center text-xs font-bold py-2 rounded-md bg-primary text-primary-foreground shadow-sm">
                  User Dashboard
               </Link>
               <Link href="/organization/dashboard" className="flex-1 text-center text-xs font-bold py-2 rounded-md text-muted-foreground hover:text-foreground transition-colors">
                  Org Dashboard
               </Link>
            </div>
        </div>
        
        <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-hide py-2">
          <Link href="/dashboard" className={getLinkClass('/dashboard')}>
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <Link href="/dashboard/explore" className={getLinkClass('/dashboard/explore')}>
            <Compass className="w-5 h-5" /> Explore Venues
          </Link>
          <Link href="/dashboard/bookings" className={getLinkClass('/dashboard/bookings')}>
            <CalendarDays className="w-5 h-5" /> My Bookings
          </Link>
          <Link href="/dashboard/saved" className={getLinkClass('/dashboard/saved')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg> Saved Venues
          </Link>
          <Link href="/dashboard/profile" className={getLinkClass('/dashboard/profile')}>
            <User className="w-5 h-5" /> Profile
          </Link>
        </nav>
        
        <div className="p-4 border-t border-border">
          <button 
              onClick={async () => {
                  await logout();
                  router.push('/login');
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>
      </aside>
      
      <main className="flex-1 overflow-auto relative bg-background">
        {children}
      </main>
    </div>
  );
}
