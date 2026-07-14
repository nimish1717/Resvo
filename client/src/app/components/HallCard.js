import Link from 'next/link';

export default function HallCard({ hall }) {
    return (
        <Link href={`/halls/${hall.id}`} className="border rounded p-4 block hover:shadow-md transition">
            <h3 className="font-semibold text-lg">{hall.name}</h3>
            <p className="text-sm text-gray-500">
                {hall.location_area} &middot; {hall.capacity} guests &middot; {hall.venue_tier}
            </p>
            <p className="mt-2 font-mono">₹{Number(hall.price_per_slot).toLocaleString('en-IN')} / slot</p>
        </Link>
    );
}
