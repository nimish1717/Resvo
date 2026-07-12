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

const searchHalls = async (req, res) => {
    try {
        const { date, capacity, venueTier } = req.query;
        if (!date || !capacity || !venueTier) {
            return res.status(400).json({ status: false, message: 'date, capacity, and venueTier are required' });
        }

        const redis = require('../lib/redisClient');
        const cacheKey = `halls:search:date=${date}:cap=${capacity}:tier=${venueTier}`;
        
        try {
            const cached = await redis.get(cacheKey);
            if (cached) {
                return res.status(200).json({ status: true, source: 'cache', halls: JSON.parse(cached) });
            }
        } catch (e) {
            console.error('Redis read error in search:', e.message);
        }

        const dayStart = new Date(`${date}T00:00:00Z`).toISOString();
        const dayEnd = new Date(`${date}T23:59:59Z`).toISOString();

        const halls = await prisma.$queryRaw`
            SELECT h.id, h.name, h.capacity, h.venue_tier, h.location_area, h.price_per_slot
            FROM halls h
            JOIN organizations o ON h.organization_id = o.id
            WHERE o.status = 'approved'
            AND h.capacity >= ${parseInt(capacity)}
            AND h.venue_tier = ${venueTier}
            AND NOT EXISTS (
                SELECT 1 FROM bookings b
                WHERE b.hall_id = h.id
                AND b.status = 'approved'
                AND b.time_range && tstzrange(${dayStart}::timestamptz, ${dayEnd}::timestamptz)
            )
        `;

        try {
            await redis.set(cacheKey, JSON.stringify(halls), 'EX', 300);
        } catch (e) {
            console.error('Redis write error in search:', e.message);
        }

        return res.status(200).json({ status: true, source: 'db', halls });
    } catch (error) {
        console.error('Error searching halls:', error);
        return res.status(500).json({ status: false, message: 'Error searching halls', error: error.message });
    }
}

module.exports = {
    getAllHalls,
    createHall,
    searchHalls
};