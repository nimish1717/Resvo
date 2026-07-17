import AppProvider from './components/AppProvider';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Resvo — Smart Scheduling Made Simple',
  description: 'Extraordinary venues for unforgettable moments',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const originalError = console.error;
              console.error = function(...args) {
                if (typeof args[0] === 'string' && (args[0].includes('hydration') || args[0].includes('A tree hydrated but some attributes of the server rendered HTML'))) {
                  return;
                }
                originalError.apply(console, args);
              };
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased transition-colors`} suppressHydrationWarning>
        <AppProvider>
          <main>{children}</main>
        </AppProvider>
      </body>
    </html>
  );
}