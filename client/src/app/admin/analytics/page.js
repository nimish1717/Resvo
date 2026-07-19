'use client';

export default function AdminAnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] p-8 font-sans text-foreground">
      <div className="max-w-[1600px] mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold mb-1">Analytics</h1>
                <p className="text-sm text-muted-foreground">Detailed platform metrics and insights.</p>
            </div>
          </div>

          <div className="bg-[#0f1014] border border-border/50 rounded-2xl overflow-hidden shadow-lg p-16 text-center">
             <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
             </div>
             <h3 className="text-xl font-bold mb-2">Analytics Dashboard Coming Soon</h3>
             <p className="text-muted-foreground max-w-md mx-auto">We are gathering more data to provide you with comprehensive insights. Check back later for detailed analytics.</p>
          </div>
      </div>
    </div>
  );
}