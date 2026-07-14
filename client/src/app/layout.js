'use client';

import { useEffect } from 'react';
import { useAuthStore } from './lib/authStore';
import Navbar from './components/Navbar';
import './globals.css';

export default function RootLayout({ children }) {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}

//https://github.com/DietrichGebert/ponytail