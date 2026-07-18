'use client';
import { useAuthStore } from '../../lib/authStore';

export default function ProfilePage() {
  const user = useAuthStore(state => state.user);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
      
      <div className="bg-card border border-border rounded-xl p-8">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user?.name || 'User Name'}</h2>
            <p className="text-muted-foreground">{user?.email || 'user@example.com'}</p>
          </div>
        </div>

        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <input 
                type="text" 
                defaultValue={user?.name || ''} 
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <input 
                type="email" 
                defaultValue={user?.email || ''} 
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary opacity-70"
                disabled
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed directly.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <input 
                type="tel" 
                defaultValue={user?.phone || ''} 
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
          
          <div className="pt-4 flex justify-end">
            <button type="button" className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}