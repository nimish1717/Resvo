'use client';

import Link from 'next/link';
import { useAuthStore } from '../lib/authStore';

export default function Navbar() {
    const user = useAuthStore((state) => state.user);
    const loading = useAuthStore((state) => state.loading);
    const logout = useAuthStore((state) => state.logout);

    return (
        <nav className="flex justify-between items-center px-6 py-4 border-b">
            <Link href="/" className="font-semibold text-lg">Resvo</Link>

            <div className="flex items-center gap-4 text-sm">
                {loading ? null : user ? (
                    <>
                        <Link href="/list-venue" className="text-gray-700">List your venue</Link>
                        <Link href="/dashboard/organizations" className="text-gray-700">My dashboard</Link>
                        <Link href="/join-organization" className="text-gray-700">Join with code</Link>
                        {user.isSuperAdmin && (
                            <Link href="/dashboard/admin" className="text-gray-700">Admin</Link>
                        )}
                        <span className="text-gray-500">Hi, {user.name}</span>
                        <button onClick={logout} className="text-red-600">Log out</button>
                    </>
                ) : (
                    <>
                        <Link href="/login">Log in</Link>
                        <Link href="/signup" className="bg-black text-white px-3 py-1.5 rounded">Sign up</Link>
                    </>
                )}
            </div>
        </nav>
    );
}