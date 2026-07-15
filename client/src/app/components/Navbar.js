'use client';

import Link from 'next/link';
import { useAuthStore } from '../lib/authStore';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/Button';
import { Search, Heart, User, LogOut } from 'lucide-react';

export default function Navbar() {
    const user = useAuthStore((state) => state.user);
    const loading = useAuthStore((state) => state.loading);
    const logout = useAuthStore((state) => state.logout);

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="text-2xl font-bold tracking-tighter">
                            Resvo<span className="text-primary">.</span>
                        </Link>
                    </div>

                    {/* Center Links (Desktop only) */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Collections</Link>
                        <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Explore</Link>
                        <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Concierge</Link>
                        <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</Link>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center space-x-4">
                        <ThemeToggle />
                        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
                            <Search className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
                            <Heart className="w-5 h-5" />
                        </button>
                        
                        {loading ? null : user ? (
                            <div className="relative group">
                                <Button variant="outline" className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    <span className="hidden sm:inline-block">{user.name}</span>
                                </Button>
                                {/* Simple hover dropdown for now to avoid complex Radix setup without full styling */}
                                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                    <div className="py-1">
                                        <Link href="/dashboard/organizations" className="block px-4 py-2 text-sm text-card-foreground hover:bg-muted">Dashboard</Link>
                                        <Link href="/list-venue" className="block px-4 py-2 text-sm text-card-foreground hover:bg-muted">List Venue</Link>
                                        {user.isSuperAdmin && (
                                            <Link href="/dashboard/admin" className="block px-4 py-2 text-sm text-card-foreground hover:bg-muted">Admin Panel</Link>
                                        )}
                                        <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-muted flex items-center gap-2">
                                            <LogOut className="w-4 h-4" /> Log out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login" className="hidden sm:inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-foreground h-9 px-4 py-2">
                                    Sign In
                                </Link>
                                <Link href="/signup" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}