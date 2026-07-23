const prisma = require('../lib/prismaClient');
const redis = require('../lib/redisClient');
const { getCachedHalls, setCachedHalls, invalidateHallsCache } = require('../lib/cache');
const cloudinary = require('../lib/cloudinary');
const { logOrganizationActivity } = require('../lib/activityLogger');

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
                        status: { in: ['approved', 'pending'] },
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

async function getHallById(req, res) {
    const { id } = req.params;

    try {
        const hall = await prisma.halls.findFirst({
            where: {
                id,
                organizations: {
                    status: 'approved',
                },
            },
        });

        if (!hall) {
            return res.status(404).json({ error: 'Hall not found' });
        }

        res.json({ hall });
    } catch (err) {
        console.error('Error fetching hall:', err);
        res.status(500).json({ error: 'Something went wrong while fetching the hall' });
    }
}

const createHall = async (req, res) => {
    try {
        const organizationId = req.organization.id;
        const { name, locationArea, capacity, venueTier, pricePerSlot } = req.body;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ status: false, message: 'At least 1 photo is required' });
        }
        if (req.files.length > 2) {
            return res.status(400).json({ status: false, message: 'Maximum 2 photos allowed' });
        }

        if (!name || !locationArea || !capacity || !venueTier || !pricePerSlot) {
            return res.status(400).json({
                status: false,
                message: 'name, locationArea, capacity, venueTier, and pricePerSlot are all required',
            });
        }

        const validTiers = ['budget', 'standard', 'premium'];
        if (!validTiers.includes(venueTier)) {
            return res.status(400).json({
                status: false,
                message: `venueTier must be one of: ${validTiers.join(', ')}`
            });
        }

        // Organization is already checked and guaranteed by verifyOrgAdmin middleware

        // Upload images to Cloudinary
        const uploadPromises = req.files.map(file => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'resvo_halls' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result.secure_url);
                    }
                );
                stream.end(file.buffer);
            });
        });
        
        const photoUrls = await Promise.all(uploadPromises);

        const hall = await prisma.halls.create({
            data: {
                organization_id: organizationId,
                name,
                location_area: locationArea,
                capacity: parseInt(capacity, 10),
                venue_tier: venueTier,
                price_per_slot: parseFloat(pricePerSlot),
                photos: photoUrls,
            },
        });

        // Invalidate halls cache because a new hall was created
        await invalidateHallsCache();
        
        await logOrganizationActivity(organizationId, 'Hall created', `Added new hall: ${name}`);

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
                AND b.status IN ('approved', 'checked_in')
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

const updateHall = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, capacity, venueTier, locationArea, pricePerSlot } = req.body;
        
        const existing = await prisma.halls.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ status: false, message: 'Hall not found' });
        }

        const hall = await prisma.halls.update({
            where: { id },
            data: {
                name: name || existing.name,
                capacity: capacity ? parseInt(capacity) : existing.capacity,
                venue_tier: venueTier || existing.venue_tier,
                location_area: locationArea || existing.location_area,
                price_per_slot: pricePerSlot ? parseFloat(pricePerSlot) : existing.price_per_slot,
            }
        });

        await invalidateHallsCache();
        await logOrganizationActivity(existing.organization_id, 'Hall updated', `Updated hall: ${existing.name}`);

        return res.status(200).json({ status: true, message: 'Hall updated successfully', hall });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Error updating hall', error: error.message });
    }
}

const deleteHall = async (req, res) => {
    try {
        const { id } = req.params;
        
        const existing = await prisma.halls.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ status: false, message: 'Hall not found' });
        }

        await prisma.$transaction(async (tx) => {
            // Delete booking actions
            await tx.$queryRaw`DELETE FROM booking_actions WHERE booking_id IN (SELECT id FROM bookings WHERE hall_id = ${id}::uuid)`;
            // Delete bookings
            await tx.$queryRaw`DELETE FROM bookings WHERE hall_id = ${id}::uuid`;
            // Delete hall
            await tx.$queryRaw`DELETE FROM halls WHERE id = ${id}::uuid`;
        });

        await invalidateHallsCache();
        await logOrganizationActivity(existing.organization_id, 'Hall deleted', `Deleted hall: ${existing.name}`);

        return res.status(200).json({ status: true, message: 'Hall deleted successfully' });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Error deleting hall', error: error.message });
    }
}

module.exports = {
    getAllHalls,
    createHall,
    searchHalls,
    getHallById,
    updateHall,
    deleteHall,
};