/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, MapPin, Star, Users } from 'lucide-react';
import { useAuthStore } from '../../lib/authStore';

export default function SavedPage() {
  const [savedVenues, setSavedVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const authFetch = useAuthStore(state => state.authFetch);

  useEffect(() => {
    async function fetchSavedVenues() {
      setLoading(false);
      setSavedVenues([]);
    }
    fetchSavedVenues();
  }, [authFetch]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-12 p-8 font-sans">
      <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Saved Venues</h1>
          <p className="text-muted-foreground text-sm">Your personalized collection of favorite spaces.</p>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        ) : savedVenues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {savedVenues.map((hall) => (
                  <div key={hall.id} className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary transition-all duration-300 flex flex-col cursor-pointer relative">
                    <button className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:bg-black/80 transition-colors">
                      <Heart className="w-4 h-4 text-primary fill-primary" />
                    </button>
                    <div className="relative h-48 bg-muted overflow-hidden">
                      {hall.photos && hall.photos.length > 0 ? (
                          <img src={hall.photos[0]} alt={hall.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                              <MapPin className="w-10 h-10 opacity-50" />
                          </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-semibold text-lg line-clamp-1 mb-1">{hall.name}</h3>
                      
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-xs text-muted-foreground line-clamp-1 flex-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {hall.location_area}
                        </p>
                        <span className="text-xs text-primary flex items-center gap-1"><Star className="w-3 h-3 fill-primary" /> 4.8</span>
                      </div>
                      
                      <div className="mt-auto flex justify-between items-end">
                        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                          <Users className="w-3 h-3" /> {hall.capacity} Pax
                        </p>
                        <p className="text-xs font-medium">
                          ₹{hall.price_per_slot} <span className="text-muted-foreground">/ slot</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
        ) : (
            <div className="bg-card border border-border rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
                <div className="bg-primary/10 p-5 rounded-full mb-6 relative">
                  <Heart className="w-10 h-10 text-primary relative z-10" />
                </div>
                
                <h3 className="text-2xl font-bold mb-3 tracking-tight">No saved venues yet</h3>
                <p className="text-muted-foreground max-w-md mb-8 text-sm">Keep track of your favorite venues by clicking the heart icon on any listing. They'll be securely saved here for easy access later.</p>
                
                <Link href="/dashboard/explore" className="group flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-all duration-300">
                  Start Exploring
                </Link>
            </div>
        )}
      </div>
    </div>
  );
}