'use client';

export default function AdminReportsPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Financial Reports</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm hover:border-primary transition-colors cursor-pointer flex flex-col items-start">
          <div className="p-3 bg-primary/10 text-primary rounded-lg mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <h3 className="font-semibold text-lg mb-1">Monthly P&L Statement</h3>
          <p className="text-muted-foreground text-sm mb-4">Download the profit and loss statement for the current month.</p>
          <button className="text-sm font-medium text-primary hover:underline mt-auto">Generate Report →</button>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl shadow-sm hover:border-primary transition-colors cursor-pointer flex flex-col items-start">
          <div className="p-3 bg-primary/10 text-primary rounded-lg mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
          <h3 className="font-semibold text-lg mb-1">Payouts Ledger</h3>
          <p className="text-muted-foreground text-sm mb-4">Export all successful payouts to organization owners.</p>
          <button className="text-sm font-medium text-primary hover:underline mt-auto">Generate Report →</button>
        </div>
      </div>
    </div>
  );
}