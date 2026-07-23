'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../app/components/ui/Card';
import { Button } from '../../app/components/ui/Button';
import { Input } from '../../app/components/ui/Input';
import { Building, Phone, MapPin, AlertTriangle, Building2, Save, X } from 'lucide-react';
import { useAuthStore } from '../../app/lib/authStore';

export default function OrgProfile() {
    const authFetch = useAuthStore((state) => state.authFetch);
    const [organization, setOrganization] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
    });

    const loadMyOrg = async () => {
        setLoading(true);
        const { response, data } = await authFetch('/organizations/mine');
        if (response.ok && data.organization) {
            setOrganization(data.organization);
            setFormData({
                name: data.organization.name || '',
                phone: data.organization.phone || '',
                address: data.organization.address || '',
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        loadMyOrg();
    }, [authFetch]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        setError('');
        setSuccess('');
        const { response, data } = await authFetch('/organizations/mine', {
            method: 'PUT',
            body: JSON.stringify(formData)
        });
        
        setIsSubmitting(false);

        if (response.ok) {
            setSuccess('Organization details updated successfully.');
            setIsEditing(false);
            loadMyOrg();
        } else {
            setError(data?.message || 'Failed to update organization');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[80vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-6 lg:p-8 pb-20">
            {/* Header */}
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
                    <Building2 className="w-8 h-8 text-primary" /> Business Settings
                </h1>
                <p className="text-muted-foreground mt-2">
                    Manage your organization's identity, contact information, and account preferences.
                </p>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 text-red-600 border border-red-500/20 rounded-xl text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> {error}
                </div>
            )}
            {success && (
                <div className="p-4 bg-green-500/10 text-green-600 border border-green-500/20 rounded-xl text-sm font-medium">
                    {success}
                </div>
            )}

            <Card className="shadow-sm border-border bg-card rounded-2xl overflow-hidden transition-all duration-300">
                <CardHeader className="bg-muted/30 border-b border-border/50 p-6 flex flex-row justify-between items-center">
                    <div>
                        <CardTitle className="text-lg">General Information</CardTitle>
                        <CardDescription>Update your contact info and organization name.</CardDescription>
                    </div>
                    {!isEditing && (
                        <Button variant="outline" onClick={() => setIsEditing(true)} className="rounded-xl shadow-sm">Edit Details</Button>
                    )}
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="grid gap-2">
                            <label htmlFor="name" className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                                <Building className="w-4 h-4 text-primary/70"/> Organization Name
                            </label>
                            <Input 
                                id="name" 
                                name="name"
                                value={formData.name} 
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={`rounded-xl transition-all ${isEditing ? 'border-primary/50 focus:ring-primary/20' : 'bg-muted/50 opacity-80 border-transparent'}`}
                            />
                        </div>
                        
                        <div className="grid gap-2">
                            <label htmlFor="phone" className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                                <Phone className="w-4 h-4 text-primary/70"/> Contact Number
                            </label>
                            <Input 
                                id="phone" 
                                name="phone"
                                value={formData.phone} 
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={`rounded-xl transition-all ${isEditing ? 'border-primary/50 focus:ring-primary/20' : 'bg-muted/50 opacity-80 border-transparent'}`}
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <label htmlFor="address" className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                                <MapPin className="w-4 h-4 text-primary/70"/> Headquarters Address
                            </label>
                            <Input 
                                id="address" 
                                name="address"
                                value={formData.address} 
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={`rounded-xl transition-all ${isEditing ? 'border-primary/50 focus:ring-primary/20' : 'bg-muted/50 opacity-80 border-transparent'}`}
                                placeholder="123 Main St, City, Country"
                            />
                        </div>
                    </div>

                    {isEditing && (
                        <div className="flex gap-3 pt-6 border-t border-border/50">
                            <Button onClick={handleSave} disabled={isSubmitting} className="rounded-xl px-6 gap-2">
                                <Save className="w-4 h-4" /> Save Changes
                            </Button>
                            <Button variant="outline" onClick={() => {
                                setIsEditing(false);
                                setFormData({
                                    name: organization?.name || '',
                                    phone: organization?.phone || '',
                                    address: organization?.address || '',
                                });
                            }} disabled={isSubmitting} className="rounded-xl gap-2">
                                <X className="w-4 h-4" /> Cancel
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="shadow-sm border-red-500/20 bg-red-500/5 mt-12 rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-red-500/10 p-6">
                    <CardTitle className="text-red-600 flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> Danger Zone</CardTitle>
                    <CardDescription className="text-red-600/70">Permanently remove your organization and all associated data.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-foreground">Delete this organization</p>
                        <p className="text-xs text-muted-foreground mt-1">This action is irreversible. All your venues and bookings will be lost.</p>
                    </div>
                    <Button variant="destructive" className="rounded-xl px-6 whitespace-nowrap">Delete Organization</Button>
                </CardContent>
            </Card>

        </div>
    );
}
