'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from './lib/api';
import HallCard from './components/HallCard';

export default function HomePage() {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadHalls() {
      const { response, data } = await apiFetch('/halls');

      if (!response.ok) {
        setError(data?.message || data?.error || 'Could not load halls');
      } else {
        setHalls(data.halls || []);
      }
      setLoading(false);
    }
    loadHalls();
  }, []);

  if (loading) return <p className="p-8">Loading halls...</p>;
  if (error) return <p className="p-8 text-red-600">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Browse verified halls</h1>

      {halls.length === 0 ? (
        <p className="text-gray-500">No halls available yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {halls.map((hall) => (
            <HallCard key={hall.id} hall={hall} />
          ))}
        </div>
      )}
    </div>
  );
}