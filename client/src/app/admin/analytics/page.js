'use client';

export default function AdminAnalyticsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Platform Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Users</h3>
          <p className="text-3xl font-bold">0</p>
          <p className="text-xs text-muted-foreground mt-2">+0 this week</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Organizations</h3>
          <p className="text-3xl font-bold">0</p>
          <p className="text-xs text-muted-foreground mt-2">0 pending approval</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Venues</h3>
          <p className="text-3xl font-bold">0</p>
          <p className="text-xs text-muted-foreground mt-2">Across 0 cities</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Bookings</h3>
          <p className="text-3xl font-bold">0</p>
          <p className="text-xs text-muted-foreground mt-2">$0.00 GMV</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
        <svg className="w-16 h-16 text-muted-foreground opacity-30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
        <h3 className="font-semibold text-lg mb-1">Platform Growth Chart</h3>
        <p className="text-muted-foreground text-sm max-w-sm">Detailed growth charts will populate as platform activity increases.</p>
      </div>
    </div>
  );
}