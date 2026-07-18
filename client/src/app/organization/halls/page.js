'use client';
import Link from 'next/link';

export default function HallsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Halls</h1>
        <Link href="/list-venue" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90">
          + Add New Hall
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-6 py-4 font-medium">Hall Name</th>
              <th className="px-6 py-4 font-medium">Location</th>
              <th className="px-6 py-4 font-medium">Capacity</th>
              <th className="px-6 py-4 font-medium">Price/Slot</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                <p className="mb-4">No halls found in your organization.</p>
                <Link href="/list-venue" className="text-primary hover:underline font-medium">
                  Create your first listing
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}