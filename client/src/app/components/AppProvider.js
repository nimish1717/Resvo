'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../lib/authStore';
import { ThemeProvider } from './ThemeProvider';
import { Toaster } from 'sonner';

export default function AppProvider({ children }) {
    const initAuth = useAuthStore((state) => state.initAuth);

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster position="bottom-right" />
        </ThemeProvider>
    );
}
