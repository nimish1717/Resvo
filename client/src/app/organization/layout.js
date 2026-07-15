
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
      } else if ('ORG_ADMIN' !== 'ANY' && user.role !== 'ORG_ADMIN') {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className="flex justify-center p-20">Loading...</div>;
  if ('ORG_ADMIN' !== 'ANY' && user.role !== 'ORG_ADMIN') return null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="h-16 border-b flex items-center px-6 justify-between bg-card">
        <div className="font-bold text-xl">Resvo. ORG_ADMIN</div>
        <nav className="flex gap-4">
          <Link href="/organization/halls" className="text-sm font-medium hover:text-primary">My Halls</Link>
          <Link href="/organization/bookings" className="text-sm font-medium hover:text-primary">Bookings</Link>
          <Link href="/organization/analytics" className="text-sm font-medium hover:text-primary">Analytics</Link>
          <Link href="/organization/messages" className="text-sm font-medium hover:text-primary">Messages</Link>
          <Link href="/organization/profile" className="text-sm font-medium hover:text-primary">Profile</Link>
        </nav>
      </header>
      <div className="flex flex-1">
        <aside className="w-64 border-r bg-card p-4 flex flex-col gap-2">
          <Link href="/organization/dashboard" className="p-2 hover:bg-muted rounded-md text-sm">Dashboard</Link>
          <Link href="/organization/halls" className="p-2 hover:bg-muted rounded-md text-sm">My Halls</Link>
          <Link href="/organization/bookings" className="p-2 hover:bg-muted rounded-md text-sm">Bookings</Link>
          <Link href="/organization/co-admins" className="p-2 hover:bg-muted rounded-md text-sm">Co-Admins</Link>
          <Link href="/organization/analytics" className="p-2 hover:bg-muted rounded-md text-sm">Analytics</Link>
        </aside>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
