'use client';
import { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';

export default function ExplorePage() {
  const [search, setSearch] = useState('');
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHalls() {
      try {
        const { response, data } = await apiFetch('/halls');
        if (response.ok && data.halls) {
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
    <div className="h-full bg-background text-foreground">
      <main className="max-w-7xl mx-auto py-6 md:py-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Explore Venues</h1>
          <p className="text-muted-foreground text-lg mb-8">Find the perfect space for your next event.</p>
          
          <div className="flex max-w-2xl gap-2">
            <input 
              type="text" 
              placeholder="Search by city, name, or type..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-card border border-border rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-md hover:opacity-90">
              Search
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <p className="text-muted-foreground">Loading venues...</p>
          </div>
        ) : filteredHalls.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <svg className="w-12 h-12 text-muted-foreground opacity-50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h3 className="text-xl font-semibold mb-2">No venues there</h3>
            <p className="text-muted-foreground max-w-sm">We couldn't find any venues matching your search. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredHalls.map((hall) => (
              <div key={hall.id} className="bg-card border border-border rounded-xl overflow-hidden group hover:border-primary transition-colors cursor-pointer">
                <div className="h-48 bg-muted flex items-center justify-center overflow-hidden">
                  {hall.photos && hall.photos.length > 0 ? (
                    <img src={hall.photos[0]} alt={hall.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <svg className="w-12 h-12 text-muted-foreground opacity-20 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{hall.name}</h3>
                    {hall.venue_tier && (
                      <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded font-medium capitalize">{hall.venue_tier}</span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">{hall.location_area} • up to {hall.capacity} guests</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold">${hall.price_per_slot}<span className="text-muted-foreground text-sm font-normal"> / hour</span></span>
                    <button className="text-sm font-medium text-primary hover:underline">View Details</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
