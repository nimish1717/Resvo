'use client';
import { useState } from 'react';

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState('upcoming');

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
      
      <div className="flex border-b border-border mb-6">
        <button 
          className={`pb-2 px-4 font-medium text-sm ${activeTab === 'upcoming' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming
        </button>
        <button 
          className={`pb-2 px-4 font-medium text-sm ${activeTab === 'past' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('past')}
        >
          Past
        </button>
      </div>

      {activeTab === 'upcoming' && (
        <div className="p-8 border border-border border-dashed rounded-xl flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>
          <h3 className="font-semibold text-lg mb-1">No upcoming bookings</h3>
          <p className="text-muted-foreground text-sm max-w-sm mb-4">You don't have any upcoming reservations. When you book a venue, it will show up here.</p>
          <a href="/explore" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90">Explore Venues</a>
        </div>
      )}

      {activeTab === 'past' && (
        <div className="p-8 border border-border border-dashed rounded-xl flex flex-col items-center justify-center text-center">
          <p className="text-muted-foreground text-sm">You have no past bookings.</p>
        </div>
      )}
    </div>
  );
}