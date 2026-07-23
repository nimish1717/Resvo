/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../../lib/authStore';
import { MoreVertical, Building2 } from 'lucide-react';

export default function AdminHallApprovalsPage() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const authFetch = useAuthStore((state) => state.authFetch);
  
  const [halls, setHalls] = useState([]);
  const [pageError, setPageError] = useState('');
  const [dataLoading, setDataLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
      async function loadData() {
          const { response, data } = await authFetch('/admin/halls/pending');
          if (!response.ok) {
              setPageError(data?.error || 'Could not load pending halls');
          } else {
              setHalls(data.halls || []);
          }
          setDataLoading(false);
      }
      if (!loading && user?.role === 'SUPER_ADMIN') {
          loadData();
      }
  }, [loading, user]);

  async function handleDecision(hallId, action) {
      setActionLoadingId(hallId);
      const { response, data } = await authFetch(`/admin/halls/${hallId}/${action}`, {
          method: 'POST',
      });
      setActionLoadingId(null);

      if (!response.ok) {
          setPageError(data?.error || 'Action failed');
          return;
      }
      setHalls((prev) => prev.filter((h) => h.id !== hallId));
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] p-8 font-sans text-foreground">
      <div className="max-w-[1600px] mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold mb-1">Hall Approvals</h1>
                <p className="text-sm text-muted-foreground">Review and moderate pending hall listings.</p>
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Search halls..." 
                className="bg-[#0f1014] border border-border/50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-64 transition-colors"
              />
            </div>
          </div>

          {pageError && <div className="text-red-500 mb-4">{pageError}</div>}

          <div className="bg-[#0f1014] border border-border/50 rounded-2xl overflow-hidden shadow-lg">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#15161b] text-muted-foreground border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Hall Name</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Organization</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Capacity</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Date Submitted</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {dataLoading ? (
                  <tr><td colSpan="5" className="px-6 py-16 text-center text-muted-foreground">Loading...</td></tr>
                ) : halls.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center text-muted-foreground">
                      <p className="font-medium">No pending hall approvals found.</p>
                    </td>
                  </tr>
                ) : (
                  halls.map(hall => (
                    <tr key={hall.id} className="hover:bg-muted/5 transition-colors">
                      <td className="px-6 py-4 font-bold">{hall.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{hall.organizations?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-muted-foreground">{hall.capacity} Guests</td>
                      <td className="px-6 py-4 text-muted-foreground">{new Date(hall.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                              <button 
                                  onClick={() => handleDecision(hall.id, 'approve')}
                                  disabled={actionLoadingId === hall.id}
                                  className="text-[10px] font-bold px-3 py-1.5 rounded border border-green-500/30 text-green-500 hover:bg-green-500/10 transition-colors"
                              >
                                  Approve
                              </button>
                              <button 
                                  onClick={() => handleDecision(hall.id, 'reject')}
                                  disabled={actionLoadingId === hall.id}
                                  className="text-[10px] font-bold px-3 py-1.5 rounded border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors"
                              >
                                  Reject
                              </button>
                          </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
      </div>
    </div>
  );
}