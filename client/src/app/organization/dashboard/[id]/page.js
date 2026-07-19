'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../../../lib/authStore';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Plus, Key, Check, X } from 'lucide-react';
import Link from 'next/link';

export default function ManageOrganizationPage({ params }) {
    const { id } = params;
    const authFetch = useAuthStore((state) => state.authFetch);
    const user = useAuthStore((state) => state.user);
    const loading = useAuthStore((state) => state.loading);
    const router = useRouter();

    const [organization, setOrganization] = useState(null);
    const [pageError, setPageError] = useState('');
    const [activeTab, setActiveTab] = useState('details');

    const [joinRequests, setJoinRequests] = useState([]);
    const [members, setMembers] = useState([]);
    const [inviteCode, setInviteCode] = useState(null);

    // Edit org state
    const [editOrgName, setEditOrgName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Hall Modal state
    const [isHallModalOpen, setIsHallModalOpen] = useState(false);
    const [editHallData, setEditHallData] = useState(null);
    const [hallFormData, setHallFormData] = useState({
        name: '',
        capacity: '',
        price_per_slot: '',
        venue_tier: 'standard',
        location_area: ''
    });

    const openAddHallModal = () => {
        setEditHallData(null);
        setHallFormData({
            name: '',
            capacity: '',
            price_per_slot: '',
            venue_tier: 'standard',
            location_area: ''
        });
        setIsHallModalOpen(true);
    };

    const openEditHallModal = (hall) => {
        setEditHallData(hall);
        setHallFormData({
            name: hall.name,
            capacity: hall.capacity,
            price_per_slot: hall.price_per_slot,
            venue_tier: hall.venue_tier,
            location_area: hall.location_area
        });
        setIsHallModalOpen(true);
    };

    const handleHallFormChange = (e) => {
        setHallFormData({ ...hallFormData, [e.target.name]: e.target.value });
    };

    const handleHallSubmit = async () => {
        setIsSubmitting(true);
        const url = editHallData ? `/halls/${editHallData.id}` : `/halls`;
        const method = editHallData ? 'PUT' : 'POST';
        
        const fd = new FormData();
        fd.append('name', hallFormData.name);
        fd.append('capacity', hallFormData.capacity);
        fd.append('pricePerSlot', hallFormData.price_per_slot);
        fd.append('venueTier', hallFormData.venue_tier);
        fd.append('locationArea', hallFormData.location_area);
        
        if (!editHallData) {
            fd.append('organizationId', organization.id);
        }

        const { response, data } = await authFetch(url, {
            method,
            body: fd
        }, true); 
        
        setIsSubmitting(false);
        if (response.ok) {
            alert(editHallData ? 'Venue updated!' : 'Venue created!');
            setIsHallModalOpen(false);
            loadOrganization();
        } else {
            alert(data?.message || 'Error saving venue');
        }
    };

    const handleDeleteHall = async (hallId) => {
        if (!confirm('Are you sure you want to permanently delete this venue? All associated bookings will be lost.')) return;
        const { response } = await authFetch(`/halls/${hallId}`, { method: 'DELETE' });
        if (response.ok) {
            loadOrganization();
        } else {
            alert('Could not delete venue');
        }
    };

    
    useEffect(() => {
        if (loading || !user) return;
        loadOrganization();
    }, [loading, user]);

    async function loadOrganization() {
        const { response, data } = await authFetch('/organizations/mine');
        if (response.ok) {
            const org = data.organizations.find(o => o.id === id);
            if (!org) {
                setPageError('Organization not found or you do not have access.');
                return;
            }
            if (org.myRole !== 'org_admin') {
                router.push('/organization/dashboard');
                return;
            }
            setOrganization(org);
            setEditOrgName(org.name);
            loadJoinRequests(org.id);
            loadMembers(org.id);
        } else {
            setPageError('Could not load organizations.');
        }
    }

    async function loadMembers(orgId) {
        const { response, data } = await authFetch(`/organizations/${orgId}/members`);
        if (response.ok) {
            setMembers(data.members || []);
        }
    }

    async function loadJoinRequests(orgId) {
        const { response, data } = await authFetch(`/organizations/${orgId}/join-requests`);
        if (response.ok) {
            setJoinRequests(data.requests || []);
        }
    }

    async function handleJoinRequestDecision(requestId, action) {
        const { response } = await authFetch(`/organizations/join-requests/${requestId}/${action}`, { method: 'POST' });
        if (response.ok) {
            loadJoinRequests(organization.id);
        }
    }

    async function generateInviteCode() {
        const { response, data } = await authFetch(`/organizations/${organization.id}/invite-code`, { method: 'POST' });
        if (response.ok) {
            setInviteCode({
                code: data.organization.invite_code,
                expiresAt: data.organization.invite_code_expires_at,
            });
        }
    }

    async function handleRemoveCoAdmin(userId) {
        if (!confirm('Are you sure you want to remove this team member?')) return;
        const { response } = await authFetch(`/organizations/${organization.id}/co-admin/${userId}`, { method: 'DELETE' });
        if (response.ok) {
            loadMembers(organization.id);
        } else {
            alert('Could not remove team member');
        }
    }

    async function handleUpdateOrgName() {
        if (!editOrgName.trim()) return;
        setIsSubmitting(true);
        const { response, data } = await authFetch(`/organizations/${organization.id}`, {
            method: 'PUT',
            body: JSON.stringify({ name: editOrgName })
        });
        setIsSubmitting(false);
        if (response.ok) {
            alert('Organization name updated!');
            loadOrganization();
        } else {
            alert(data?.message || 'Could not update organization');
        }
    }

    if (loading || !organization) return (
        <div className="flex justify-center items-center h-[60vh]">
            {pageError ? <p className="text-red-500">{pageError}</p> : <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>}
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/organization/dashboard">
                    <Button variant="outline" size="sm">Back</Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage {organization.name}</h1>
                    <p className="text-muted-foreground mt-1">Update details, venues, and team members.</p>
                </div>
            </div>

            <div className="flex gap-4 border-b border-border mb-6">
                <button 
                    onClick={() => setActiveTab('details')}
                    className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                    Details
                </button>
                <button 
                    onClick={() => setActiveTab('venues')}
                    className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'venues' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                    Venues
                </button>
                <button 
                    onClick={() => setActiveTab('team')}
                    className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'team' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                    Team
                </button>
            </div>

            {activeTab === 'details' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Organization Details</CardTitle>
                        <CardDescription>Update the basic information of your organization.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 max-w-md">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Organization Name</label>
                            <input 
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={editOrgName}
                                onChange={(e) => setEditOrgName(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleUpdateOrgName} disabled={isSubmitting || editOrgName === organization.name || !editOrgName.trim()}>
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {activeTab === 'venues' && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Venues</CardTitle>
                            <CardDescription>Manage halls and spaces for this organization.</CardDescription>
                        </div>
                        <Button className="gap-2" onClick={openAddHallModal}><Plus className="w-4 h-4" /> Add Venue</Button>
                    </CardHeader>
                    <CardContent>
                        {organization.halls?.length === 0 ? (
                            <div className="text-center p-8 border border-dashed rounded-md">
                                <p className="text-muted-foreground">No venues found.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {organization.halls.map(hall => (
                                    <div key={hall.id} className="border rounded-lg p-4 flex justify-between items-start">
                                        <div>
                                            <h4 className="font-semibold">{hall.name}</h4>
                                            <p className="text-sm text-muted-foreground">{hall.location_area}</p>
                                            <div className="mt-2 text-xs text-muted-foreground space-y-1">
                                                <p>Capacity: {hall.capacity}</p>
                                                <p>Price: ${hall.price_per_slot}/slot</p>
                                                <p>Tier: {hall.venue_tier}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => openEditHallModal(hall)}>Edit</Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteHall(hall.id)}>Delete</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {activeTab === 'team' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Team Members</CardTitle>
                                <CardDescription>People who can manage bookings and venues for this organization.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {members.length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic">No team members found.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {members.map(member => (
                                            <div key={member.id} className="flex justify-between items-center border p-3 rounded-md">
                                                <div>
                                                    <p className="font-medium text-sm">{member.users.name}</p>
                                                    <p className="text-xs text-muted-foreground">{member.users.email}</p>
                                                </div>
                                                <div className="flex gap-2 items-center">
                                                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded-full uppercase tracking-wider">{member.role.replace('_', ' ')}</span>
                                                    {member.role !== 'org_admin' && (
                                                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2" onClick={() => handleRemoveCoAdmin(member.user_id)}>Remove</Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>Pending Join Requests</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {joinRequests.length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic">No pending requests.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {joinRequests.map(req => (
                                            <div key={req.id} className="flex justify-between items-center border p-3 rounded-md">
                                                <div>
                                                    <p className="font-medium text-sm">{req.users.name}</p>
                                                    <p className="text-xs text-muted-foreground">{req.users.email}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleJoinRequestDecision(req.id, 'approve')}><Check className="w-4 h-4 mr-1"/> Approve</Button>
                                                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleJoinRequestDecision(req.id, 'reject')}><X className="w-4 h-4 mr-1"/> Reject</Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                    
                    <div className="md:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Invite Code</CardTitle>
                                <CardDescription>Generate a code to invite co-admins.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button onClick={generateInviteCode} className="w-full gap-2"><Key className="w-4 h-4" /> Generate New Code</Button>
                                {inviteCode && (
                                    <div className="bg-primary/5 border border-primary/20 rounded-md p-3 text-center">
                                        <p className="font-mono text-xl font-bold tracking-widest text-primary mb-1">{inviteCode.code}</p>
                                        <p className="text-xs text-muted-foreground">Expires: {new Date(inviteCode.expiresAt).toLocaleString()}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Hall Modal */}
            {isHallModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
                        <CardHeader>
                            <CardTitle>{editHallData ? 'Edit Venue' : 'Add New Venue'}</CardTitle>
                            <CardDescription>{editHallData ? 'Update the details of your venue.' : 'Create a new venue for this organization.'}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <label className="text-sm font-medium">Name</label>
                                    <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" name="name" value={hallFormData.name} onChange={handleHallFormChange} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Capacity</label>
                                    <input type="number" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" name="capacity" value={hallFormData.capacity} onChange={handleHallFormChange} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Price Per Slot</label>
                                    <input type="number" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" name="price_per_slot" value={hallFormData.price_per_slot} onChange={handleHallFormChange} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Venue Tier</label>
                                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" name="venue_tier" value={hallFormData.venue_tier} onChange={handleHallFormChange}>
                                        <option value="standard">Standard</option>
                                        <option value="premium">Premium</option>
                                        <option value="luxury">Luxury</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Location Area</label>
                                    <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" name="location_area" value={hallFormData.location_area} onChange={handleHallFormChange} required />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <Button variant="outline" onClick={() => { setIsHallModalOpen(false); setEditHallData(null); }} disabled={isSubmitting}>Cancel</Button>
                                <Button onClick={handleHallSubmit} disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : 'Save Venue'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
