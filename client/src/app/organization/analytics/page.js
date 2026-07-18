'use client';

export default function OrgAnalyticsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics & Reports</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Revenue</h3>
          <p className="text-3xl font-bold">$0.00</p>
          <p className="text-xs text-muted-foreground mt-2">+0% from last month</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Bookings</h3>
          <p className="text-3xl font-bold">0</p>
          <p className="text-xs text-muted-foreground mt-2">0 upcoming</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Profile Views</h3>
          <p className="text-3xl font-bold">0</p>
          <p className="text-xs text-muted-foreground mt-2">Past 30 days</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
        <svg className="w-12 h-12 text-muted-foreground opacity-50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
        <h3 className="font-semibold text-lg mb-1">Not enough data</h3>
        <p className="text-muted-foreground text-sm max-w-sm">Charts and detailed analytics will appear here once your venues start receiving bookings and views.</p>
      </div>
    </div>
  );
}