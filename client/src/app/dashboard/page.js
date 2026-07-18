'use client';
import { useAuthStore } from '../lib/authStore';

export default function Page() {
  const user = useAuthStore(state => state.user);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Welcome back, {user?.name || 'User'}!</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-card border rounded-lg shadow-sm">
          <h2 className="font-semibold mb-2">My Bookings</h2>
          <p className="text-muted-foreground text-sm">You have no upcoming bookings.</p>
        </div>
        <div className="p-6 bg-card border rounded-lg shadow-sm">
          <h2 className="font-semibold mb-2">Saved Venues</h2>
          <p className="text-muted-foreground text-sm">0 venues saved.</p>
        </div>
      </div>
    </div>
  );
}