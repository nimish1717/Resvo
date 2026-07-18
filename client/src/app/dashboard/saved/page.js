'use client';
import Link from 'next/link';

export default function SavedPage() {
  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Saved Venues</h1>
      
      <div className="p-12 border border-border border-dashed rounded-xl flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
        </div>
        <h3 className="font-semibold text-xl mb-2">No saved venues yet</h3>
        <p className="text-muted-foreground text-sm max-w-md mb-6">Keep track of your favorite venues by clicking the heart icon on any listing. They'll be saved here for easy access later.</p>
        <Link href="/explore" className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90">
          Start Exploring
        </Link>
      </div>
    </div>
  );
}