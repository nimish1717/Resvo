
'use client';
import { useAuthStore } from '../lib/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Layout({ children }) {
  const user = useAuthStore(state => state.user);
  const loading = useAuthStore(state => state.loading);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if ('USER' !== 'ANY' && user.role !== 'USER') {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className="flex justify-center p-20">Loading...</div>;
  if ('USER' !== 'ANY' && user.role !== 'USER') return null;

  const getLinkClass = (path) => {
    const isActive = pathname === path;
    return `p-2 rounded-md text-sm transition-colors ${isActive ? 'bg-muted border border-border' : 'hover:bg-muted'}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">

      <div className="flex flex-1">
        <aside className="w-64 border-r bg-card p-4 flex flex-col gap-2">
          <div className="font-bold text-2xl mb-6 px-2">Resvo</div>
          <Link href="/dashboard/explore" className="p-2 mb-4 bg-primary text-primary-foreground text-center rounded-md text-sm font-semibold hover:opacity-90 transition-opacity">
            Explore Venues
          </Link>
          <Link href="/dashboard" className={getLinkClass('/dashboard')}>Dashboard</Link>
          <Link href="/dashboard/bookings" className={getLinkClass('/dashboard/bookings')}>My Bookings</Link>
          <Link href="/dashboard/saved" className={getLinkClass('/dashboard/saved')}>Saved Venues</Link>
          <Link href="/dashboard/profile" className={getLinkClass('/dashboard/profile')}>Profile</Link>
          <div className="mt-4 pt-4 border-t border-border">
            <Link href="/join-organization" className={getLinkClass('/join-organization')}>Join / Create Org</Link>
          </div>
        </aside>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
