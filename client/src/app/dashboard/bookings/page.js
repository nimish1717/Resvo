/* eslint-disable react/no-unescaped-entities */
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CalendarDays, Clock, ArrowRight, History, CheckCircle2, AlertCircle, XCircle, Users } from 'lucide-react';
import { useAuthStore } from '../../lib/authStore';

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const authFetch = useAuthStore(state => state.authFetch);

  const formatTimeRange = (rangeStr) => {
      if (!rangeStr) return '';
      const clean = rangeStr.replace(/[\[\]\(\)]/g, '');
      const [start, end] = clean.split(',').map(s => s.trim().replace(/"/g, ''));
      const startDate = new Date(start);
      const endDate = new Date(end);
      return {
          date: startDate.getDate(),
          month: startDate.toLocaleString('default', { month: 'short' }),
          timeStr: `${startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
      };
  };

  useEffect(() => {
    async function fetchBookings() {
      try {
        setLoading(true);
        // Note: Assuming a GET /bookings endpoint for user bookings. 
        // If it doesn't exist, this will gracefully fall back to empty state.
        const { response, data } = await authFetch('/bookings');
        if (response.ok && data?.bookings) {
          setBookings(data.bookings);
        }
      } catch (err) {
        console.error('Failed to fetch bookings', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, [authFetch]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-12 p-8 font-sans">
      <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-semibold mb-6">My Bookings</h1>
          
          <div className="flex gap-8">
            <button 
              className={`pb-4 font-medium text-sm transition-all duration-300 relative ${activeTab === 'upcoming' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming
              {activeTab === 'upcoming' && <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary rounded-t-full"></span>}
            </button>
            <button 
              className={`pb-4 font-medium text-sm transition-all duration-300 relative ${activeTab === 'past' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('past')}
            >
              Past
              {activeTab === 'past' && <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary rounded-t-full"></span>}
            </button>
            <button 
              className={`pb-4 font-medium text-sm transition-all duration-300 relative ${activeTab === 'cancelled' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('cancelled')}
            >
              Cancelled
              {activeTab === 'cancelled' && <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary rounded-t-full"></span>}
            </button>
          </div>
        </div>
        <Link href="/dashboard/explore" className="bg-card border border-border text-foreground hover:border-primary transition-colors px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2">
            <span>+</span> New Booking
        </Link>
      </div>

      <div className="mt-6">
        {loading ? (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        ) : bookings.length > 0 ? (
            <div className="flex flex-col gap-4">
                {bookings.map((booking) => (
                    <div key={booking.id} className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between group hover:border-primary transition-colors">
                        <div className="flex items-center gap-6 w-full md:w-auto mb-4 md:mb-0">
                            <div className="text-center w-12 flex-shrink-0 flex flex-col items-center justify-center">
                                <p className="text-2xl font-light text-primary">{formatTimeRange(booking.time_range).date}</p>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{formatTimeRange(booking.time_range).month}</p>
                            </div>
                            
                            <div className="w-24 h-16 rounded-md bg-muted overflow-hidden flex-shrink-0 border border-border flex items-center justify-center">
                                <CalendarDays className="w-6 h-6 text-muted-foreground/50" />
                            </div>
                            
                            <div>
                                <h4 className="font-semibold text-foreground mb-1">{booking.hall_name || 'Venue'}</h4>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTimeRange(booking.time_range).timeStr}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between w-full md:w-auto md:gap-12">
                            <div className="flex flex-col items-end gap-2">
                                <span className={`border bg-transparent text-xs px-2 py-1 rounded flex items-center gap-1 ${booking.status === 'confirmed' ? 'text-emerald-500 border-emerald-500/30' : 'text-primary border-primary/30'}`}>
                                    {booking.status}
                                </span>
                                <button className="text-xs text-muted-foreground hover:text-primary transition-colors">View Details</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="bg-card border border-border rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
                <div className="bg-primary/10 p-5 rounded-full mb-6 relative">
                  <CalendarDays className="w-10 h-10 text-primary relative z-10" />
                </div>
                
                <h3 className="text-2xl font-bold mb-3 tracking-tight">No available bookings</h3>
                <p className="text-muted-foreground max-w-md mb-8 text-sm">You don't have any bookings yet. When you book a venue, it will securely appear here.</p>
                
                <Link href="/dashboard/explore" className="group flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-all duration-300">
                  Explore Venues <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        )}
      </div>
    </div>
  );
}