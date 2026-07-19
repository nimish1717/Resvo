'use client';

export default function AdminReportsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] p-8 font-sans text-foreground">
      <div className="max-w-[1600px] mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold mb-1">Reports</h1>
                <p className="text-sm text-muted-foreground">System reports and issue tracking.</p>
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Search reports..." 
                className="bg-[#0f1014] border border-border/50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-64 transition-colors"
              />
            </div>
          </div>

          <div className="bg-[#0f1014] border border-border/50 rounded-2xl overflow-hidden shadow-lg">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#15161b] text-muted-foreground border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Report ID</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Type</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Submitted By</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Status</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-muted-foreground">
                    <p className="font-medium">No reports found.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
      </div>
    </div>
  );
}