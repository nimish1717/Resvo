const prisma = require('../lib/prismaClient');

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await prisma.users.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
            orderBy: { created_at: 'desc' }
        });

        res.json({ users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

// Get all organizations
exports.getAllOrganizations = async (req, res) => {
    try {
        const organizations = await prisma.organizations.findMany({
            include: {
                users: {
                    select: { name: true, email: true }
                },
                _count: {
                    select: { halls: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });
        res.json({ organizations });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch organizations' });
    }
};

// Get pending halls
exports.getPendingHalls = async (req, res) => {
    try {
        const halls = await prisma.halls.findMany({
            where: { status: 'pending' },
            include: {
                organizations: {
                    select: { name: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });
        res.json({ halls });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch pending halls' });
    }
};

// Update hall status
exports.updateHallStatus = async (req, res) => {
    const { id } = req.params;
    const { action } = req.params; // approve or reject
    
    if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ error: 'Invalid action' });
    }

    try {
        const updatedHall = await prisma.halls.update({
            where: { id },
            data: { status: action === 'approve' ? 'approved' : 'rejected' }
        });
        res.json({ message: `Hall ${action}d successfully`, hall: updatedHall });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Failed to ${action} hall` });
    }
};

// Update organization status
exports.updateOrganizationStatus = async (req, res) => {
    const { id } = req.params;
    const { action } = req.params; // approve or reject
    
    if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ error: 'Invalid action' });
    }

    try {
        const updatedOrg = await prisma.organizations.update({
            where: { id },
            data: { status: action === 'approve' ? 'approved' : 'rejected' }
        });
        res.json({ message: `Organization ${action}d successfully`, organization: updatedOrg });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Failed to ${action} organization` });
    }
};

// Get admin stats
exports.getAdminStats = async (req, res) => {
    try {
        const [users, organizations, pendingHalls, approvedHalls, bookings] = await Promise.all([
            prisma.users.count(),
            prisma.organizations.count(),
            prisma.halls.count({ where: { status: 'pending' } }),
            prisma.halls.count({ where: { status: 'approved' } }),
            prisma.bookings.count()
        ]);
        
        // For revenue, we might just mock it or calculate based on bookings if we had a price. 
        // For now, let's return a static revenue or just bookings count.
        res.json({
            users,
            organizations,
            pendingHalls,
            approvedHalls,
            bookings,
            revenue: '14.8L' // Placeholder for UI
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
};
