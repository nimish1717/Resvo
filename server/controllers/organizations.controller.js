const prisma = require('../lib/prismaClient');
const { invalidateHallsCache } = require('../lib/cache');

const getMyOrganization = async (req, res) => {
    try {
        // req.organization is populated by verifyOrgAdmin middleware
        const organization = await prisma.organizations.findUnique({
            where: { id: req.organization.id },
            include: { halls: true },
        });

        res.json({ organization });
    } catch (err) {
        console.error('Error fetching my organization:', err);
        res.status(500).json({ error: 'Something went wrong while fetching your organization' });
    }
}

const getPendingOrganizations = async (req, res) => {
    try {
        const organizations = await prisma.organizations.findMany({
            where: { status: 'pending' },
            orderBy: { created_at: 'asc' },
            include: { users: { select: { name: true, email: true, phone: true } } }
        });
        return res.status(200).json({
            status: true,
            message: 'Pending organizations fetched successfully',
            organizations
        });
    } catch (error) {
        console.error('Error fetching pending organizations:', error);
        return res.status(500).json({
            status: false,
            message: 'Something went wrong while fetching pending organizations',
            error: error.message
        });
    }
}

async function transitionOrganization(id, targetStatus) {
    const result = await prisma.organizations.updateMany({
        where: { id, status: 'pending' },
        data: { status: targetStatus },
    });

    if (result.count > 0) {
        await invalidateHallsCache();
    }

    return result.count > 0;
}

const approveOrganization = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await transitionOrganization(id, 'approved');
        if (!updated) {
            return res.status(404).json({
                status: false,
                message: 'Organization not found, or it is not in a pending state'
            });
        }
        const organization = await prisma.organizations.findUnique({ where: { id } });
        return res.status(200).json({
            status: true,
            message: 'Organization approved successfully',
            organization
        });
    } catch (error) {
        console.error('Error approving organization:', error);
        return res.status(500).json({
            status: false,
            message: 'Something went wrong while approving the organization',
            error: error.message
        });
    }
}

const rejectOrganization = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await transitionOrganization(id, 'rejected');
        if (!updated) {
            return res.status(404).json({
                status: false,
                message: 'Organization not found, or it is not in a pending state'
            });
        }
        const organization = await prisma.organizations.findUnique({ where: { id } });
        return res.status(200).json({
            status: true,
            message: 'Organization rejected successfully',
            organization
        });
    } catch (error) {
        console.error('Error rejecting organization:', error);
        return res.status(500).json({
            status: false,
            message: 'Something went wrong while rejecting the organization',
            error: error.message
        });
    }
}

const editOrganization = async (req, res) => {
    try {
        const id = req.organization.id;
        const { name, phone, address } = req.body;

        if (!name) {
            return res.status(400).json({ status: false, message: 'Name is required' });
        }

        const orgRows = await prisma.$queryRaw`
            UPDATE organizations 
            SET name = ${name}, phone = ${phone || null}, address = ${address || null}
            WHERE id = ${id}::uuid 
            RETURNING *;
        `;

        if (orgRows.length === 0) {
            return res.status(404).json({ status: false, message: 'Organization not found' });
        }

        return res.status(200).json({ status: true, message: 'Organization updated successfully', organization: orgRows[0] });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Error updating organization', error: error.message });
    }
}

const deleteOrganization = async (req, res) => {
    try {
        const id = req.organization.id;

        await prisma.$transaction(async (tx) => {
            // Delete booking actions
            await tx.$queryRaw`
                DELETE FROM booking_actions
                WHERE booking_id IN (
                    SELECT b.id FROM bookings b
                    JOIN halls h ON b.hall_id = h.id
                    WHERE h.organization_id = ${id}::uuid
                )
            `;

            // Delete bookings
            await tx.$queryRaw`
                DELETE FROM bookings 
                WHERE hall_id IN (
                    SELECT id FROM halls WHERE organization_id = ${id}::uuid
                )
            `;

            // Delete halls
            await tx.$queryRaw`DELETE FROM halls WHERE organization_id = ${id}::uuid`;

            // Delete the organization
            await tx.$queryRaw`DELETE FROM organizations WHERE id = ${id}::uuid`;
        });

        return res.status(200).json({ status: true, message: 'Organization deleted successfully' });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Error deleting organization', error: error.message });
    }
}

const getMyActivities = async (req, res) => {
    try {
        const id = req.organization.id;
        const limit = parseInt(req.query.limit) || 10;
        
        const activities = await prisma.organization_activity_logs.findMany({
            where: { organization_id: id },
            orderBy: { created_at: 'desc' },
            take: limit
        });

        return res.status(200).json({ status: true, activities });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Error fetching activities', error: error.message });
    }
}

module.exports = {
    getMyOrganization,
    getPendingOrganizations,
    approveOrganization,
    rejectOrganization,
    editOrganization,
    deleteOrganization,
    getMyActivities,
}