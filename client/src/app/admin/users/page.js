'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../../lib/authStore';

export default function AdminUsersPage() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const authFetch = useAuthStore((state) => state.authFetch);
  
  const [users, setUsers] = useState([]);
  const [pageError, setPageError] = useState('');
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
      async function loadData() {
          const { response, data } = await authFetch('/admin/users');
          if (!response.ok) {
              setPageError(data?.error || 'Could not load users');
          } else {
              setUsers(data.users || []);
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
                <h1 className="text-2xl font-bold mb-1">Users</h1>
                <p className="text-sm text-muted-foreground">Manage platform users and their roles.</p>
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Search users..." 
                className="bg-[#0f1014] border border-border/50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-64 transition-colors"
              />
            </div>
          </div>

          {pageError && <div className="text-red-500 mb-4">{pageError}</div>}

          <div className="bg-[#0f1014] border border-border/50 rounded-2xl overflow-hidden shadow-lg">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#15161b] text-muted-foreground border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Name</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Email</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Role</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {dataLoading ? (
                  <tr><td colSpan="4" className="px-6 py-16 text-center text-muted-foreground">Loading...</td></tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-16 text-center text-muted-foreground">
                      <p className="font-medium">No users found.</p>
                    </td>
                  </tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id} className="hover:bg-muted/5 transition-colors">
                      <td className="px-6 py-4 font-bold">{u.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${u.role === 'Super Admin' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : u.role === 'Org Admin' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
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