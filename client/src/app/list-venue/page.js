'use client';

import { useState } from 'react';
import { useAuthStore } from '../lib/authStore';

export default function ListVenuePage() {
    const authFetch = useAuthStore((state) => state.authFetch);
    const user = useAuthStore((state) => state.user);

    const [orgName, setOrgName] = useState('');
    const [orgResult, setOrgResult] = useState(null);
    const [orgError, setOrgError] = useState('');
    const [orgSubmitting, setOrgSubmitting] = useState(false);

    const [hallForm, setHallForm] = useState({
        name: '', locationArea: '', capacity: '', venueTier: 'standard', pricePerSlot: '',
    });
    const [hallResult, setHallResult] = useState(null);
    const [hallError, setHallError] = useState('');
    const [hallSubmitting, setHallSubmitting] = useState(false);

    async function handleOrgSubmit(e) {
        e.preventDefault();
        setOrgError('');
        setOrgSubmitting(true);

        const { response, data } = await authFetch('/organizations', {
            method: 'POST',
            body: JSON.stringify({ name: orgName }),
        });

        setOrgSubmitting(false);

        if (!response.ok) {
            setOrgError(data?.message || data?.error || 'Something went wrong');
            return;
        }
        setOrgResult(data.organization);
    }

    async function handleHallSubmit(e) {
        e.preventDefault();
        setHallError('');
        setHallSubmitting(true);

        const { response, data } = await authFetch('/halls', {
            method: 'POST',
            body: JSON.stringify({
                organizationId: orgResult.id,
                name: hallForm.name,
                locationArea: hallForm.locationArea,
                capacity: parseInt(hallForm.capacity, 10),
                venueTier: hallForm.venueTier,
                pricePerSlot: parseFloat(hallForm.pricePerSlot),
            }),
        });

        setHallSubmitting(false);

        if (!response.ok) {
            setHallError(data?.message || data?.error || 'Something went wrong');
            return;
        }
        setHallResult(data.hall);
    }

    if (!user) {
        return <p className="p-8 text-red-600">Please log in to list a venue.</p>;
    }

    return (
        <div className="max-w-lg mx-auto px-4 py-10">
            <h1 className="text-2xl font-semibold mb-6">List your venue</h1>

            {/* Step 1: create the organization */}
            {!orgResult ? (
                <form onSubmit={handleOrgSubmit} className="flex flex-col gap-3">
                    <p className="text-sm text-gray-600">
                        Step 1 — submit your business for review. A Super Admin approves it before
                        your halls become publicly visible.
                    </p>
                    <input
                        type="text"
                        placeholder="Organization / business name"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        required
                        className="border rounded px-3 py-2"
                    />
                    {orgError && <p className="text-red-600 text-sm">{orgError}</p>}
                    <button
                        type="submit"
                        disabled={orgSubmitting}
                        className="bg-black text-white rounded px-3 py-2 disabled:opacity-50"
                    >
                        {orgSubmitting ? 'Submitting...' : 'Submit for review'}
                    </button>
                </form>
            ) : (
                <div className="border rounded p-4 bg-yellow-50 mb-6">
                    <p className="font-medium">"{orgResult.name}" submitted</p>
                    <p className="text-sm text-gray-600 mt-1">
                        Status: <span className="font-mono">{orgResult.status}</span> — a Super Admin
                        needs to approve this before halls under it are publicly visible. You can still
                        add halls now; they'll appear once approved.
                    </p>
                </div>
            )}

            {/* Step 2: add a hall under it, once the org exists */}
            {orgResult && !hallResult && (
                <form onSubmit={handleHallSubmit} className="flex flex-col gap-3 mt-6">
                    <p className="text-sm text-gray-600">Step 2 — add a hall under this organization.</p>
                    <input
                        type="text" placeholder="Hall name" required
                        value={hallForm.name}
                        onChange={(e) => setHallForm({ ...hallForm, name: e.target.value })}
                        className="border rounded px-3 py-2"
                    />
                    <input
                        type="text" placeholder="Location / area" required
                        value={hallForm.locationArea}
                        onChange={(e) => setHallForm({ ...hallForm, locationArea: e.target.value })}
                        className="border rounded px-3 py-2"
                    />
                    <input
                        type="number" placeholder="Capacity (guests)" required
                        value={hallForm.capacity}
                        onChange={(e) => setHallForm({ ...hallForm, capacity: e.target.value })}
                        className="border rounded px-3 py-2"
                    />
                    <select
                        value={hallForm.venueTier}
                        onChange={(e) => setHallForm({ ...hallForm, venueTier: e.target.value })}
                        className="border rounded px-3 py-2"
                    >
                        <option value="budget">Budget</option>
                        <option value="standard">Standard</option>
                        <option value="premium">Premium</option>
                    </select>
                    <input
                        type="number" placeholder="Price per slot (₹)" required
                        value={hallForm.pricePerSlot}
                        onChange={(e) => setHallForm({ ...hallForm, pricePerSlot: e.target.value })}
                        className="border rounded px-3 py-2"
                    />
                    {hallError && <p className="text-red-600 text-sm">{hallError}</p>}
                    <button
                        type="submit"
                        disabled={hallSubmitting}
                        className="bg-black text-white rounded px-3 py-2 disabled:opacity-50"
                    >
                        {hallSubmitting ? 'Adding...' : 'Add hall'}
                    </button>
                </form>
            )}

            {hallResult && (
                <div className="border rounded p-4 bg-green-50 mt-6">
                    <p className="font-medium">"{hallResult.name}" added</p>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage it from your{' '}
                        <a href="/dashboard/organizations" className="underline">organization dashboard</a>.
                    </p>
                </div>
            )}
        </div>
    );
}