const prisma = require('../lib/prismaClient');

const getStats = async (req, res) => {
    try {
        const [halls, organizations, bookings] = await Promise.all([
            prisma.halls.count(),
            prisma.organizations.count({ where: { status: 'approved' } }),
            prisma.bookings.count({ where: { status: { in: ['approved', 'checked_in', 'completed'] } } })
        ]);
        res.json({ halls, organizations, bookings });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

const getOrgOverview = async (req, res) => {
    try {
        const organizationId = req.organization.id;

        const [halls, activeBookings, pendingBookings] = await Promise.all([
            prisma.halls.count({ where: { organization_id: organizationId } }),
            prisma.bookings.count({
                where: {
                    halls: { organization_id: organizationId },
                    status: { in: ['approved', 'checked_in'] }
                }
            }),
            prisma.bookings.count({
                where: {
                    halls: { organization_id: organizationId },
                    status: 'requested'
                }
            })
        ]);

        // Revenue calculations
        const paidBookings = await prisma.bookings.findMany({
            where: {
                halls: { organization_id: organizationId },
                payment_status: 'paid',
                status: { notIn: ['cancelled', 'rejected'] }
            },
            select: { total_amount: true, created_at: true }
        });

        let totalRevenue = 0;
        let monthlyRevenue = 0;
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        for (const b of paidBookings) {
            const amount = parseFloat(b.total_amount || 0);
            totalRevenue += amount;
            if (b.created_at) {
                const date = new Date(b.created_at);
                if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                    monthlyRevenue += amount;
                }
            }
        }

        res.json({
            halls,
            activeBookings,
            pendingBookings,
            totalRevenue,
            monthlyRevenue
        });

    } catch (err) {
        console.error('Error fetching org overview stats:', err);
        res.status(500).json({ error: 'Failed to fetch org stats' });
    }
};

const getOrgAnalytics = async (req, res) => {
    try {
        const organizationId = req.organization.id;
        
        // Mocked or simple analytics for now, can be expanded
        const popularHalls = await prisma.bookings.groupBy({
            by: ['hall_id'],
            where: {
                halls: { organization_id: organizationId },
                status: { notIn: ['cancelled', 'rejected'] }
            },
            _count: { hall_id: true },
            orderBy: { _count: { hall_id: 'desc' } },
            take: 5
        });
        
        // Need to fetch hall names for the popular halls
        const hallIds = popularHalls.map(p => p.hall_id);
        const hallsData = await prisma.halls.findMany({
            where: { id: { in: hallIds } },
            select: { id: true, name: true }
        });
        
        const popularHallsWithNames = popularHalls.map(p => ({
            name: hallsData.find(h => h.id === p.hall_id)?.name || 'Unknown',
            bookings: p._count.hall_id
        }));

        res.json({
            popularHalls: popularHallsWithNames,
            // Add more analytics like monthly trends here as needed
        });
    } catch (err) {
        console.error('Error fetching org analytics:', err);
        res.status(500).json({ error: 'Failed to fetch org analytics' });
    }
};

module.exports = {
    getStats,
    getOrgOverview,
    getOrgAnalytics
};
