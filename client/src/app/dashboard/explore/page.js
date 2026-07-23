/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
'use client';
import { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Search, MapPin, Users, Star, ArrowRight, Calendar, DollarSign, Filter, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function ExplorePage() {
  const [search, setSearch] = useState('');
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHalls() {
      try {
        const { response, data } = await apiFetch('/halls');
        if (response.ok && data?.halls) {
          setHalls(data.halls);
        }
      } catch (error) {
        console.error('Failed to fetch halls:', error);
      } finally {
        setLoading(false);
      }
    }
    loadHalls();
  }, []);

  const filteredHalls = halls.filter((hall) => {
    const q = search.toLowerCase();
    return (
      (hall.name && hall.name.toLowerCase().includes(q)) ||
      (hall.location_area && hall.location_area.toLowerCase().includes(q)) ||
      (hall.venue_tier && hall.venue_tier.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-background text-foreground pb-12 p-8">
      
      {/* Top Search Bar */}
      <div className="relative mb-8">
        <div className="bg-card border border-border rounded-full p-2 flex items-center shadow-lg">
          <div className="pl-4 pr-3 text-muted-foreground">
            <Search className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            placeholder="Search venues, locations or collections..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-sm py-2"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm hover:border-primary transition-colors">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span>Location</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm hover:border-primary transition-colors">
            <Star className="w-4 h-4 text-muted-foreground" />
            <span>Event Type</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm hover:border-primary transition-colors">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>Date</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm hover:border-primary transition-colors">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>Guests</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm hover:border-primary transition-colors">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span>Budget</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm hover:border-primary transition-colors">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span>Filters</span>
        </button>
      </div>

      <div className="flex justify-between items-end mb-6">
        <h2 className="text-xl font-bold">Popular Venues</h2>
        <span className="text-sm text-muted-foreground">Sort by: <span className="text-primary cursor-pointer">Recommended &gt;</span></span>
      </div>

      <main>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-card border border-border rounded-2xl h-[300px]"></div>
            ))}
          </div>
        ) : filteredHalls.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-16 flex flex-col items-center justify-center text-center">
            <Search className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold mb-2">No venues found</h3>
            <p className="text-muted-foreground">We couldn't find any venues matching "{search}". Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredHalls.map((hall) => (
              <Link href={`/halls/${hall.id}`} key={hall.id} className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary transition-all duration-300 flex flex-col cursor-pointer">
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
                    <p className="text-xs text-muted-foreground line-clamp-1 flex-1">{hall.location_area || 'Location unavailable'}</p>
                    <span className="text-xs text-primary flex items-center gap-1"><Star className="w-3 h-3 fill-primary" /> 4.8</span>
                  </div>
                  
                  <div className="mt-auto">
                    <p className="text-xs font-medium">
                      {hall.capacity ? `${hall.capacity} Pax` : 'Variable Pax'} - <span className="text-muted-foreground">${hall.price_per_slot || 0}</span>
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Banner */}
        <div className="bg-card border border-border rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center relative overflow-hidden mt-8">
            <div className="relative z-10 text-center md:text-left mb-6 md:mb-0">
                <h3 className="text-2xl font-bold mb-2">Planning something special?</h3>
                <p className="text-muted-foreground">Our concierge team will help you find the perfect venue.</p>
            </div>
            <button className="relative z-10 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
                Get Expert Help
            </button>
            {/* Optional decorative background elements could go here */}
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none"></div>
        </div>

      </main>
    </div>
  );
}
