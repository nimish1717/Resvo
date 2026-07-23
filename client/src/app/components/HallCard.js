/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { Users, MapPin, Star } from 'lucide-react';

export default function HallCard({ hall }) {
    const defaultImage = hall.photos && hall.photos.length > 0 
        ? hall.photos[0] 
        : 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800';

    return (
        <Link href={`/halls/${hall.id}`} className="group block rounded-xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-lg hover:border-primary/50 transition-all duration-300">
            <div className="relative h-64 overflow-hidden">
                <img 
                    src={defaultImage} 
                    alt={hall.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded text-xs font-medium uppercase tracking-wider">
                    {hall.venue_tier}
                </div>
            </div>
            
            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-xl tracking-tight text-card-foreground group-hover:text-primary transition-colors">{hall.name}</h3>
                    <div className="flex items-center gap-1 text-primary">
                        <Star className="w-4 h-4 fill-primary" />
                        <span className="text-sm font-medium">4.8</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{hall.location_area || 'Location Area'}</span>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{hall.capacity} Pax</span>
                    </div>
                    <div className="text-right">
                        <span className="font-semibold text-lg text-foreground">₹{Number(hall.price_per_slot).toLocaleString('en-IN')}</span>
                        <span className="text-xs text-muted-foreground ml-1">/ slot</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
