'use client';
import { useState } from 'react';

export default function OrgBookingsPage() {
  const [activeTab, setActiveTab] = useState('pending');

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Booking Requests</h1>
      
      <div className="flex border-b border-border mb-6">
        <button 
          className={`pb-2 px-4 font-medium text-sm ${activeTab === 'pending' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Requests
        </button>
        <button 
          className={`pb-2 px-4 font-medium text-sm ${activeTab === 'confirmed' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('confirmed')}
        >
          Confirmed
        </button>
        <button 
          className={`pb-2 px-4 font-medium text-sm ${activeTab === 'history' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-6 py-4 font-medium">Guest</th>
              <th className="px-6 py-4 font-medium">Hall</th>
              <th className="px-6 py-4 font-medium">Date & Time</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                <p>No {activeTab} bookings found.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}