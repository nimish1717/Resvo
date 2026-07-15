
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
      } else if ('SUPER_ADMIN' !== 'ANY' && user.role !== 'SUPER_ADMIN') {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className="flex justify-center p-20">Loading...</div>;
  if ('SUPER_ADMIN' !== 'ANY' && user.role !== 'SUPER_ADMIN') return null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="h-16 border-b flex items-center px-6 justify-between bg-card">
        <div className="font-bold text-xl">Resvo. SUPER_ADMIN</div>
        <nav className="flex gap-4">
          <Link href="/admin/organizations" className="text-sm font-medium hover:text-primary">Organizations</Link>
          <Link href="/admin/hall-approvals" className="text-sm font-medium hover:text-primary">Hall Approvals</Link>
          <Link href="/admin/users" className="text-sm font-medium hover:text-primary">Users</Link>
          <Link href="/admin/reports" className="text-sm font-medium hover:text-primary">Reports</Link>
          <Link href="/admin/profile" className="text-sm font-medium hover:text-primary">Profile</Link>
        </nav>
      </header>
      <div className="flex flex-1">
        <aside className="w-64 border-r bg-card p-4 flex flex-col gap-2">
          <Link href="/admin/dashboard" className="p-2 hover:bg-muted rounded-md text-sm">Dashboard</Link>
          <Link href="/admin/organizations" className="p-2 hover:bg-muted rounded-md text-sm">Organizations</Link>
          <Link href="/admin/hall-approvals" className="p-2 hover:bg-muted rounded-md text-sm">Hall Approvals</Link>
          <Link href="/admin/users" className="p-2 hover:bg-muted rounded-md text-sm">Users</Link>
          <Link href="/admin/reports" className="p-2 hover:bg-muted rounded-md text-sm">Reports</Link>
          <Link href="/admin/analytics" className="p-2 hover:bg-muted rounded-md text-sm">Analytics</Link>
        </aside>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
