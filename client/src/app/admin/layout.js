'use client';
import { useAuthStore } from '../lib/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Building2, ShieldCheck, Users, FileText, BarChart3, Settings, Bell, Headset, LogOut } from 'lucide-react';

export default function Layout({ children }) {
  const user = useAuthStore(state => state.user);
  const loading = useAuthStore(state => state.loading);
  const pathname = usePathname();
  const router = useRouter();

  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role === 'SUPER_ADMIN') {
        const fetchStats = async () => {
          const { response, data } = await useAuthStore.getState().authFetch('/admin/stats');
          if (response.ok) {
            setStats(data);
          }
        };
        fetchStats();
      }
    }
  }, [user, loading, router]);

  if (loading || !user) return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
  );

  const getLinkClass = (path) => {
    const isActive = pathname === path || (path !== '/admin/dashboard' && pathname.startsWith(path));
    return `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-300 relative rounded-lg mb-1 ${
      isActive 
      ? 'text-primary bg-primary/10 border border-primary/20' 
      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
    }`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0c] text-foreground font-sans">
      {/* Top Navbar */}
      <header className="h-16 border-b border-border/50 flex items-center px-6 justify-between bg-[#0f1014] z-30 relative">
        <Link href="/" className="text-3xl font-serif font-bold tracking-tight text-[#E2C391] hover:opacity-90 transition-opacity flex items-center gap-2">
            Resvo
        </Link>
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-muted-foreground border-r border-border/50 pr-6">
                <button 
                    onClick={async () => {
                        await useAuthStore.getState().logout();
                        router.push('/login');
                    }}
                    className="flex items-center gap-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded-md transition-colors text-sm font-medium"
                >
                    <LogOut className="w-4 h-4" /> Logout
                </button>
            </div>
            <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold">{user?.name || 'Admin User'}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Super Admin</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary font-bold">
                    {user?.name?.charAt(0) || 'A'}
                </div>
            </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border/50 bg-[#0f1014] p-4 flex flex-col justify-between relative z-20">
          <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-hide pt-2">
            <Link href="/admin/dashboard" className={getLinkClass('/admin/dashboard')}>
                <LayoutDashboard className="w-5 h-5" /> Dashboard
            </Link>
            <Link href="/admin/organizations" className={getLinkClass('/admin/organizations')}>
                <Building2 className="w-5 h-5" /> Organizations
            </Link>

            <Link href="/admin/users" className={getLinkClass('/admin/users')}>
                <Users className="w-5 h-5" /> Users
            </Link>
            <Link href="/admin/reports" className={getLinkClass('/admin/reports')}>
                <FileText className="w-5 h-5" /> Reports
            </Link>
            <Link href="/admin/analytics" className={getLinkClass('/admin/analytics')}>
                <BarChart3 className="w-5 h-5" /> Analytics
            </Link>
            <Link href="/admin/profile" className={getLinkClass('/admin/profile')}>
                <Settings className="w-5 h-5" /> Profile
            </Link>
          </nav>

          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col items-center text-center">
                <ShieldCheck className="w-6 h-6 text-primary mb-2" />
                <h4 className="text-xs font-bold text-foreground">Resvo Control Center</h4>
                <p className="text-[10px] text-muted-foreground mt-1">Manage your platform with confidence.</p>
            </div>

          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-[#0a0a0c] relative">
          {children}
        </main>
      </div>
    </div>
  );
}
