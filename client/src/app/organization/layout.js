
'use client';
import { useAuthStore } from '../lib/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Layout({ children }) {
  const user = useAuthStore(state => state.user);
  const loading = useAuthStore(state => state.loading);
  const pathname = usePathname();
  const router = useRouter();

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
    const isActive = pathname === path || (path !== '/organization/dashboard' && pathname.startsWith(path));
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
               <Link href="/dashboard" className="flex-1 text-center text-xs font-bold py-2 rounded-md text-muted-foreground hover:text-foreground transition-colors">
                  User Dashboard
               </Link>
               <Link href="/organization/dashboard" className="flex-1 text-center text-xs font-bold py-2 rounded-md bg-primary text-primary-foreground shadow-sm">
                  Org Dashboard
               </Link>
            </div>
        </div>
        
        <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-hide py-2">
          <Link href="/organization/dashboard" className={getLinkClass('/organization/dashboard')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg> Dashboard
          </Link>
          <Link href="/organization/dashboard" className={getLinkClass('/organization/halls')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg> My Venues
          </Link>
          <Link href="/organization/dashboard" className={getLinkClass('/organization/bookings')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> Bookings
          </Link>
          <Link href="/organization/dashboard" className={getLinkClass('/organization/analytics')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg> Analytics
          </Link>
        </nav>
        
        <div className="p-4 border-t border-border">
          <button 
              onClick={async () => {
                  await useAuthStore.getState().logout();
                  router.push('/login');
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>
            Log out
          </button>
        </div>
      </aside>
      
      <main className="flex-1 overflow-auto relative bg-background">
        {children}
      </main>
    </div>
  );
}
