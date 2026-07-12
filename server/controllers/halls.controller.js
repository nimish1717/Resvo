const prisma = require('../lib/prismaClient');
const { getCachedHalls, setCachedHalls, invalidateHallsCache } = require('../lib/cache');

async function getAllHalls(req, res) {
    try {
        let source = 'cache';
        const cacheResponse = await getCachedHalls();
        let halls = cacheResponse.status ? cacheResponse.data : null;

        if (!halls) {
            source = 'db';
            halls = await prisma.halls.findMany({
                where: {
                    organizations: {
                        status: 'approved',
                    },
                },
                orderBy: {
                    created_at: 'desc',
                },
            });
            await setCachedHalls(halls);
        }

        res.json({ source, halls });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong while fetching halls'
        });
    }
}

const createHall = async (req, res) => {
    try {
        const { organizationId, name, locationArea, capacity, venueTier, pricePerSlot } = req.body;

        if (!organizationId || !name || !locationArea || !capacity || !venueTier || !pricePerSlot) {
            return res.status(400).json({
                status: false,
                message: 'organizationId, name, locationArea, capacity, venueTier, and pricePerSlot are all required',
            });
        }

        const validTiers = ['budget', 'standard', 'premium'];
        if (!validTiers.includes(venueTier)) {
            return res.status(400).json({ 
                status: false,
                message: `venueTier must be one of: ${validTiers.join(', ')}` 
            });
        }

        const organization = await prisma.organizations.findUnique({ where: { id: organizationId } });
        if (!organization) {
            return res.status(404).json({ 
                status: false,
                message: 'Organization not found' 
            });
        }

        const hall = await prisma.halls.create({
            data: {
                organization_id: organizationId,
                name,
                location_area: locationArea,
                capacity,
                venue_tier: venueTier,
                price_per_slot: pricePerSlot,
            },
        });

        // Invalidate halls cache because a new hall was created
        await invalidateHallsCache();

        return res.status(201).json({ 
            status: true,
            message: 'Hall created successfully',
            hall 
        });
    } catch (err) {
        console.error('Error creating hall:', err);
        return res.status(500).json({ 
            status: false,
            message: 'Something went wrong while creating the hall',
            error: err.message
        });
    }
}

module.exports = {
    getAllHalls,
    createHall
};