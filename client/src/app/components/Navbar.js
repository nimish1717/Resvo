'use client';

import Link from 'next/link';
import { useAuthStore } from '../lib/authStore';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/Button';
import { Search, User, LogOut } from 'lucide-react';

export default function Navbar() {
    const user = useAuthStore((state) => state.user);
    const loading = useAuthStore((state) => state.loading);
    const logout = useAuthStore((state) => state.logout);

    return (
        <nav className="absolute top-0 z-50 w-full bg-transparent">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-24 items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="text-3xl font-serif font-bold tracking-tight text-[#E2C391]">
                            Resvo
                        </Link>
                    </div>

                    {/* Center Links (Desktop only) */}
                    <div className="hidden md:flex items-center space-x-10">
                        <Link href="#features" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Features</Link>
                        <Link href="#reviews" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Reviews</Link>
                        <Link href="#about" className="text-sm font-medium text-white/80 hover:text-white transition-colors">About Us</Link>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center space-x-6">
                        <button className="text-white/80 hover:text-white transition-colors hidden sm:block">
                            <Search className="w-5 h-5" />
                        </button>
                        
                        {loading ? null : user ? (
                            <div className="flex items-center gap-4">
                                <Link href="/dashboard" className="hidden sm:inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-colors bg-[#E2C391] text-black shadow hover:bg-[#E2C391]/90 h-10 px-6 py-2">
                                    Dashboard
                                </Link>
                                <div className="relative group">
                                    <Button variant="outline" className="flex items-center gap-2 border-white/20 text-white hover:bg-white/10 rounded-full h-10 px-4">
                                        <User className="w-4 h-4" />
                                        <span className="hidden sm:inline-block font-medium">{user.name}</span>
                                    </Button>
                                    <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-2xl bg-black/90 backdrop-blur-xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                                        <div className="py-2">
                                            <Link href="/dashboard" className="block px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors">Dashboard</Link>
                                            <Link href="/join-organization" className="block px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors">Create Organization</Link>
                                            <Link href="/list-venue" className="block px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors">List Venue</Link>
                                            <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/10 flex items-center gap-2 transition-colors">
                                                <LogOut className="w-4 h-4" /> Log out
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/login" className="hidden sm:inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-colors border border-white/20 text-white hover:bg-white/10 h-10 px-6 py-2">
                                    Sign In
                                </Link>
                                <Link href="/signup" className="inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-colors bg-[#E2C391] text-black shadow hover:bg-[#E2C391]/90 h-10 px-6 py-2">
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