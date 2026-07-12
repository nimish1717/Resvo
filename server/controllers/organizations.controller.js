const prisma = require('../lib/prismaClient');

const createOrganization = async (req, res) => {
    try {
        const { name } = req.body;
        const ownerUserId = req.user.userId;
        
        if (!name) {
            return res.status(400).json({
                status: false,
                message: 'name is required'
            });
        }
        
        const organization = await prisma.$transaction(async (tx) => {
            const org = await tx.organizations.create({
                data: {
                    owner_user_id: ownerUserId,
                    name,
                },
            });
            
            await tx.organization_members.create({
                data: {
                    organization_id: org.id,
                    user_id: ownerUserId,
                    role: 'org_admin'
                }
            });
            
            return org;
        });
        return res.status(201).json({
            status: true,
            message: 'Organization created successfully',
            organization
        });
    } catch (error) {
        console.error('Error creating organization:', error);
        return res.status(500).json({
            status: false,
            message: 'Something went wrong while creating the organization',
            error: error.message
        });
    }
}

const getPendingOrganizations = async (req, res) => {
    try {
        const organizations = await prisma.organizations.findMany({
            where: { status: 'pending' },
            orderBy: { created_at: 'asc' },
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

const requestChangesOrganization = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await transitionOrganization(id, 'changes_requested');
        if (!updated) {
            return res.status(404).json({
                status: false,
                message: 'Organization not found, or it is not in a pending state'
            });
        }
        const organization = await prisma.organizations.findUnique({ where: { id } });
        return res.status(200).json({
            status: true,
            message: 'Changes requested successfully',
            organization
        });
    } catch (error) {
        console.error('Error requesting changes on organization:', error);
        return res.status(500).json({
            status: false,
            message: 'Something went wrong while requesting changes',
            error: error.message
        });
    }
}

module.exports = {
    createOrganization,
    getPendingOrganizations,
    approveOrganization,
    rejectOrganization,
    requestChangesOrganization,
}