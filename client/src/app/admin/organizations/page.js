/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../../lib/authStore';

export default function AdminOrganizationsPage() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const authFetch = useAuthStore((state) => state.authFetch);
  
  const [organizations, setOrganizations] = useState([]);
  const [pageError, setPageError] = useState('');
  const [dataLoading, setDataLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [viewOrg, setViewOrg] = useState(null);

  async function handleDecision(orgId, action) {
      setActionLoadingId(orgId);
      const { response, data } = await authFetch(`/admin/organizations/${orgId}/${action}`, {
          method: 'POST',
      });
      setActionLoadingId(null);

      if (!response.ok) {
          setPageError(data?.error || 'Action failed');
          return;
      }
      setOrganizations((prev) => 
        prev.map(org => org.id === orgId ? { ...org, status: action === 'approve' ? 'approved' : 'rejected' } : org)
      );
  }

  useEffect(() => {
      async function loadData() {
          const { response, data } = await authFetch('/admin/organizations');
          if (!response.ok) {
              setPageError(data?.error || 'Could not load organizations');
          } else {
              setOrganizations(data.organizations || []);
          }
          setDataLoading(false);
      }
      if (!loading && user?.role === 'SUPER_ADMIN') {
          loadData();
      }
  }, [loading, user]);

  return (
    <div className="min-h-screen bg-[#0a0a0c] p-8 font-sans text-foreground">
      <div className="max-w-[1600px] mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold mb-1">Organizations</h1>
                <p className="text-sm text-muted-foreground">Manage all registered organizations on the platform.</p>
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Search organizations..." 
                className="bg-[#0f1014] border border-border/50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-64 transition-colors"
              />
            </div>
          </div>

          {pageError && <div className="text-red-500 mb-4">{pageError}</div>}

          <div className="bg-[#0f1014] border border-border/50 rounded-2xl overflow-hidden shadow-lg">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#15161b] text-muted-foreground border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Organization Name</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Owner</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Venues</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Status</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {dataLoading ? (
                  <tr><td colSpan="5" className="px-6 py-16 text-center text-muted-foreground">Loading...</td></tr>
                ) : organizations.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center text-muted-foreground">
                      <p className="font-medium">No organizations found.</p>
                    </td>
                  </tr>
                ) : (
                  organizations.map(org => (
                    <tr key={org.id} className="hover:bg-muted/5 transition-colors">
                      <td className="px-6 py-4 font-bold">{org.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{org.users?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-muted-foreground">{org._count?.halls || 0} Halls</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${org.status === 'approved' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : org.status === 'rejected' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                          {org.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                              {org.status === 'pending' && (
                                <>
                                  <button 
                                      onClick={() => handleDecision(org.id, 'approve')}
                                      disabled={actionLoadingId === org.id}
                                      className="text-[10px] font-bold px-3 py-1.5 rounded border border-green-500/30 text-green-500 hover:bg-green-500/10 transition-colors"
                                  >
                                      Approve
                                  </button>
                                  <button 
                                      onClick={() => handleDecision(org.id, 'reject')}
                                      disabled={actionLoadingId === org.id}
                                      className="text-[10px] font-bold px-3 py-1.5 rounded border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors"
                                  >
                                      Reject
                                  </button>
                                </>
                              )}
                              <button 
                                  onClick={() => setViewOrg(org)}
                                  className="text-[10px] font-bold px-3 py-1.5 rounded border border-blue-500/30 text-blue-500 hover:bg-blue-500/10 transition-colors"
                              >
                                  View Details
                              </button>
                          </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Details Modal */}
          {viewOrg && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
              <div className="bg-[#15161b] border border-border/50 rounded-2xl w-full max-w-lg shadow-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold">{viewOrg.name}</h2>
                    <p className="text-xs text-muted-foreground">Owner: {viewOrg.users?.name || 'Unknown'} ({viewOrg.users?.email || 'N/A'})</p>
                  </div>
                  <button onClick={() => setViewOrg(null)} className="text-muted-foreground hover:text-foreground">
                    ✕
                  </button>
                </div>
                
                <div className="space-y-6">

                  
                  <div className="flex gap-4">
                    <div className="flex-1 bg-[#0f1014] p-4 rounded-lg border border-border/30 text-center">
                      <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Total Venues</p>
                      <p className="text-2xl font-bold">{viewOrg._count?.halls || 0}</p>
                    </div>
                    <div className="flex-1 bg-[#0f1014] p-4 rounded-lg border border-border/30 text-center">
                      <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Current Status</p>
                      <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded font-bold uppercase ${viewOrg.status === 'approved' ? 'bg-green-500/10 text-green-500' : viewOrg.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                        {viewOrg.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}