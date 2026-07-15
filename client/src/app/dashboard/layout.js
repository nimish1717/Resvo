
'use client';
import { useAuthStore } from '../lib/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Layout({ children }) {
  const user = useAuthStore(state => state.user);
  const loading = useAuthStore(state => state.loading);
  const router = useRouter();

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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="h-16 border-b flex items-center px-6 justify-between bg-card">
        <div className="font-bold text-xl">Resvo. USER</div>
        <nav className="flex gap-4">
          <Link href="/explore" className="text-sm font-medium hover:text-primary">Explore</Link>
          <Link href="/list-venue" className="text-sm font-medium hover:text-primary">Book Venue</Link>
          <Link href="/dashboard" className="text-sm font-medium hover:text-primary">My Organizations</Link>
          <Link href="/dashboard/profile" className="text-sm font-medium hover:text-primary">Profile</Link>
        </nav>
      </header>
      <div className="flex flex-1">
        <aside className="w-64 border-r bg-card p-4 flex flex-col gap-2">
          <Link href="/dashboard" className="p-2 hover:bg-muted rounded-md text-sm">Dashboard</Link>
          <Link href="/dashboard/bookings" className="p-2 hover:bg-muted rounded-md text-sm">My Bookings</Link>
          <Link href="/dashboard/saved" className="p-2 hover:bg-muted rounded-md text-sm">Saved Venues</Link>
          <Link href="/dashboard/messages" className="p-2 hover:bg-muted rounded-md text-sm">Messages</Link>
          <Link href="/dashboard/profile" className="p-2 hover:bg-muted rounded-md text-sm">Profile</Link>
        </aside>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
