'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function JoinOrganizationPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/dashboard/organizations');
    }, [router]);
    return null;
}