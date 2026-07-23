
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
          <Link href="/dashboard/organizations" className={getLinkClass('/dashboard/organizations')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg> Manage Teams
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
