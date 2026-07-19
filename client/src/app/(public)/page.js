'use client';
import Link from 'next/link';
import { Search, MapPin, Calendar, Users, ArrowRight, Sparkles, Star, Building, Users2, CalendarCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

export default function HomePage() {
  const [stats, setStats] = useState({ halls: 0, organizations: 0, bookings: 0 });

  useEffect(() => {
    async function loadStats() {
      try {
        const { response, data } = await apiFetch('/stats');
        if (response.ok) setStats(data);
      } catch (err) {
        console.error('Failed to load stats', err);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
      
      {/* Decorative ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-500/5 blur-[150px]" />
      </div>

      {/* Hero Section */}
      <section className="relative w-full h-screen min-h-[700px] flex flex-col items-center justify-center z-10 overflow-hidden">
        {/* Background Image & Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/bg.png')" }}
        />
        <div className="absolute inset-0 z-0 bg-black/40" />
        {/* Strong bottom fade to merge seamlessly into the page background */}
        <div className="absolute bottom-[-1px] left-0 right-0 h-64 bg-gradient-to-t from-background via-background/80 to-transparent z-0" />

        <div className="container relative z-10 px-4 flex flex-col items-center text-center mt-16">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-md text-sm text-white/80 mb-8">
            <Sparkles className="w-4 h-4 text-[#E2C391]" />
            <span>The new standard for venue booking</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tight mb-6 max-w-4xl leading-[1.1] text-white">
            Extraordinary spaces <br className="hidden md:block" />
            for <br className="hidden md:block" />
            <span className="font-sans italic text-transparent bg-clip-text bg-gradient-to-r from-[#A7C8E7] via-[#85B0D6] to-[#5C8DB8] px-2 font-medium tracking-normal text-[1.1em]">unforgettable</span> <br className="hidden md:block" />
            moments
          </h1>
          
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mb-12 font-light leading-relaxed">
            Discover and book the world's most exceptional venues for weddings, celebrations, and corporate events.
          </p>
          
          <Link href="/dashboard/explore">
            <Button size="lg" className="rounded-full px-12 py-6 text-lg font-medium bg-[#E2C391] hover:bg-[#d4b37f] text-black shadow-[0_0_40px_rgba(226,195,145,0.3)] hover:shadow-[0_0_60px_rgba(226,195,145,0.5)] transition-all">
              Explore Venues
            </Button>
          </Link>
        </div>
      </section>

      {/* Live Stats Section */}
      <section className="py-16 relative z-10 border-b border-border/30 bg-transparent">
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-border/50">
            <div className="flex flex-col items-center py-4 md:py-0">
              <Building className="w-8 h-8 text-[#E2C391] mb-4 opacity-90 drop-shadow-[0_0_15px_rgba(226,195,145,0.5)]" />
              <h3 className="text-4xl md:text-5xl font-bold mb-2 text-white">{stats.halls}+</h3>
              <p className="text-white/60 font-medium uppercase tracking-wider text-sm">Exclusive Venues</p>
            </div>
            <div className="flex flex-col items-center py-4 md:py-0">
              <Users2 className="w-8 h-8 text-[#E2C391] mb-4 opacity-90 drop-shadow-[0_0_15px_rgba(226,195,145,0.5)]" />
              <h3 className="text-4xl md:text-5xl font-bold mb-2 text-white">{stats.organizations}+</h3>
              <p className="text-white/60 font-medium uppercase tracking-wider text-sm">Verified Hosts</p>
            </div>
            <div className="flex flex-col items-center py-4 md:py-0">
              <CalendarCheck className="w-8 h-8 text-[#E2C391] mb-4 opacity-90 drop-shadow-[0_0_15px_rgba(226,195,145,0.5)]" />
              <h3 className="text-4xl md:text-5xl font-bold mb-2 text-white">{stats.bookings}+</h3>
              <p className="text-white/60 font-medium uppercase tracking-wider text-sm">Successful Events</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlight Section */}
      <section id="features" className="py-24 relative z-10 bg-card/30 border-b border-border/50 backdrop-blur-sm scroll-mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">Elevate your events with premium spaces.</h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                We've curated a highly exclusive list of properties that redefine luxury and aesthetics. From modern minimalist lofts to sweeping historical estates.
              </p>
              
              <div className="space-y-6 pt-4">
                {[
                  { title: 'Verified Properties', desc: 'Every venue is physically inspected for quality.' },
                  { title: 'Transparent Pricing', desc: 'No hidden fees. Book with complete confidence.' },
                  { title: 'Concierge Support', desc: '24/7 dedicated assistance for your event planning.' }
                ].map((feature, i) => (
                  <div key={i} className="flex gap-4 items-start group cursor-pointer">
                    <div className="p-3 rounded-xl bg-muted/50 group-hover:bg-primary/10 transition-colors border border-border/50">
                      <Star className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">{feature.title}</h4>
                      <p className="text-muted-foreground">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="order-1 lg:order-2 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-blue-500/20 rounded-3xl blur-3xl transform rotate-3" />
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-border/50 shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200" 
                  alt="Premium Event Space" 
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                  <div className="backdrop-blur-md bg-white/10 border border-white/20 p-4 rounded-xl text-white">
                    <p className="text-sm font-medium opacity-80 uppercase tracking-wider mb-1">Featured Location</p>
                    <p className="text-xl font-bold">The Glasshouse Estate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-24 relative z-10 scroll-mt-20">
        <div className="container px-4 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Loved by our hosts and guests</h2>
            <p className="text-xl text-muted-foreground">Hear what the community has to say about Resvo.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah Jenkins', role: 'Event Planner', quote: 'Resvo transformed how I source venues. The properties are stunning and the platform is incredibly intuitive.' },
              { name: 'Michael Chen', role: 'Corporate Host', quote: 'We booked our annual retreat through Resvo. The transparency in pricing and concierge support saved us hours.' },
              { name: 'Elena Rodriguez', role: 'Venue Owner', quote: 'Listing my property on Resvo brought me the exact high-end clientele I was looking for. Simply the best platform.' }
            ].map((review, i) => (
              <div key={i} className="bg-card/40 backdrop-blur-md border border-border/50 p-8 rounded-3xl hover:border-primary/50 transition-colors">
                <div className="flex gap-1 mb-6">
                  {[1,2,3,4,5].map(star => <Star key={star} className="w-5 h-5 text-primary fill-primary" />)}
                </div>
                <p className="text-lg mb-8 italic text-muted-foreground">"{review.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center font-bold text-lg border border-border">{review.name.charAt(0)}</div>
                  <div>
                    <h4 className="font-semibold">{review.name}</h4>
                    <p className="text-sm text-muted-foreground">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expanded About Us & Final CTA */}
      <section id="about" className="py-32 relative z-10 flex items-center justify-center text-center scroll-mt-20 border-t border-border/50 bg-card/20">
        <div className="container px-4 max-w-4xl flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-sm text-primary mb-8 font-medium">
            About Us
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-8">Bridging the gap between extraordinary spaces and visionaries.</h2>
          
          <div className="space-y-6 text-xl text-muted-foreground font-light leading-relaxed mb-16 text-left md:text-center">
            <p>
              Founded in 2024, Resvo was built on a simple premise: the perfect space shouldn't be hidden behind endless phone calls, opaque pricing, and outdated booking systems. 
            </p>
            <p>
              We empower organizations to monetize their stunning properties, while providing event planners, corporate teams, and individuals with a seamless, intuitive booking experience. Whether you're hosting an intimate workshop or a gala for 500, we ensure every detail of your reservation is flawless.
            </p>
          </div>

          <div className="p-8 md:p-12 bg-background border border-border/50 rounded-3xl shadow-xl w-full flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-primary" />
            <h3 className="text-3xl font-bold mb-4">Start discovering amazing venues today.</h3>
            <p className="text-muted-foreground mb-8 text-lg">Browse our curated selection and find the perfect match.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/dashboard/explore" className="w-full sm:w-auto">
                <Button size="lg" className="rounded-full px-8 py-6 text-lg w-full shadow-lg shadow-primary/20">
                  Explore Spaces
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border bg-background pt-16 pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <Link href="/" className="text-3xl font-bold tracking-tighter mb-4 inline-block">
                Resvo<span className="text-primary">.</span>
              </Link>
              <p className="text-muted-foreground mb-6">
                Redefining the standard for premium venue reservations and event hosting.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">Platform</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><Link href="/dashboard/explore" className="hover:text-primary transition-colors">Explore Venues</Link></li>
                <li><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="#reviews" className="hover:text-primary transition-colors">Reviews</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">Hosts</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><Link href="/dashboard/organizations" className="hover:text-primary transition-colors">List Your Venue</Link></li>
                <li><Link href="/dashboard" className="hover:text-primary transition-colors">Host Dashboard</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Host Guidelines</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">Support</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between text-muted-foreground text-sm">
            <p>© {new Date().getFullYear()} Resvo Inc. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <span className="cursor-pointer hover:text-foreground transition-colors">Twitter</span>
              <span className="cursor-pointer hover:text-foreground transition-colors">Instagram</span>
              <span className="cursor-pointer hover:text-foreground transition-colors">LinkedIn</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}