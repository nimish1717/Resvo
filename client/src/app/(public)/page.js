'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import HallCard from '../components/HallCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Search, Calendar, Users } from 'lucide-react';

export default function HomePage() {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadHalls() {
      const { response, data } = await apiFetch('/halls');

      if (!response.ok) {
        setError(data?.message || data?.error || 'Could not load halls');
      } else {
        setHalls(data.halls || []);
      }
      setLoading(false);
    }
    loadHalls();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-20 lg:py-32 overflow-hidden flex flex-col items-center justify-center bg-muted/30">
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 to-background z-0" />
        <div className="container relative z-10 px-4 md:px-6 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 max-w-4xl">
            Extraordinary venues for <br />
            <span className="text-primary italic font-serif font-medium">unforgettable</span> moments
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12">
            Discover and book the world's most exceptional venues for weddings, celebrations, corporate events and more.
          </p>
          
          {/* Search Bar */}
          <div className="w-full max-w-4xl bg-card rounded-full shadow-lg border border-border p-2 flex flex-col md:flex-row items-center gap-2">
            <div className="flex-1 flex items-center px-4 gap-2 text-muted-foreground w-full border-b md:border-b-0 md:border-r border-border py-2 md:py-0">
              <Search className="w-5 h-5" />
              <Input type="text" placeholder="Where are you planning?" className="border-0 shadow-none focus-visible:ring-0 bg-transparent text-foreground placeholder:text-muted-foreground/70" />
            </div>
            <div className="flex-1 flex items-center px-4 gap-2 text-muted-foreground w-full border-b md:border-b-0 md:border-r border-border py-2 md:py-0">
              <Calendar className="w-5 h-5" />
              <Input type="text" placeholder="Date" className="border-0 shadow-none focus-visible:ring-0 bg-transparent text-foreground placeholder:text-muted-foreground/70" />
            </div>
            <div className="flex-1 flex items-center px-4 gap-2 text-muted-foreground w-full py-2 md:py-0">
              <Users className="w-5 h-5" />
              <Input type="number" placeholder="Guests" className="border-0 shadow-none focus-visible:ring-0 bg-transparent text-foreground placeholder:text-muted-foreground/70" />
            </div>
            <Button size="lg" className="rounded-full px-8 w-full md:w-auto font-medium">Explore Venues</Button>
          </div>
        </div>
      </section>

      {/* Curated Collections */}
      <section className="py-16 md:py-24 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Curated Collections</h2>
            <p className="text-muted-foreground">Handpicked venues for every occasion</p>
          </div>
          <Button variant="ghost" className="hidden sm:inline-flex text-primary hover:text-primary hover:bg-primary/10">View all collections &rarr;</Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {/* Placeholder Collection Cards */}
          {[
            { name: 'Modern Elegance', count: 24 },
            { name: 'Garden & Outdoor', count: 15 },
            { name: 'Heritage Spaces', count: 32 },
            { name: 'Urban Lofts', count: 18 }
          ].map((collection, i) => (
            <div key={i} className="group relative rounded-xl overflow-hidden aspect-[4/5] cursor-pointer">
              <img src={`https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800&sig=${i}`} alt={collection.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4 sm:p-6 w-full">
                <h3 className="text-white font-semibold text-lg sm:text-xl mb-1">{collection.name}</h3>
                <p className="text-white/70 text-sm">{collection.count} Venues</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Venues */}
      <section className="py-16 bg-muted/20 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-end justify-between mb-10">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Featured Venues</h2>
            <div className="flex gap-2">
               <span className="text-sm text-muted-foreground flex items-center">Sort by: <strong className="ml-1 text-foreground cursor-pointer">Recommended</strong></span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-950/20 text-red-600 p-4 rounded-xl text-center border border-red-200 dark:border-red-900/50">
              {error}
            </div>
          ) : halls.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-xl">
              No halls available yet. Check back soon.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {halls.map((hall) => (
                <HallCard key={hall.id} hall={hall} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}