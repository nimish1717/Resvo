const crypto = require('crypto');
const prisma = require('../lib/prismaClient');
const { invalidateHallsCache } = require('../lib/cache');

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

const getMyOrganizations = async (req, res) => {
    try {
        const memberships = await prisma.organization_members.findMany({
            where: { user_id: req.user.userId },
            include: {
                organizations: {
                    include: { halls: true },
                },
            },
        });

        const organizations = memberships.map((m) => ({
            ...m.organizations,
            myRole: m.role,
        }));

        res.json({ organizations });
    } catch (err) {
        console.error('Error fetching my organizations:', err);
        res.status(500).json({ error: 'Something went wrong while fetching your organizations' });
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

    if (result.count > 0) {
        // Any status change on an org can flip its halls' public visibility —
        // bust the cache so GET /halls doesn't serve a stale list.
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

const generateInviteCode = async (req, res) => {
    try {
        const { id } = req.params;
        const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 char string

        const updated = await prisma.$queryRaw`
            UPDATE organizations 
            SET invite_code = ${inviteCode}, invite_code_expires_at = now() + interval '5 minutes'
            WHERE id = ${id}::uuid
            RETURNING id, name, invite_code, invite_code_expires_at;
        `;

        if (updated.length === 0) {
            return res.status(404).json({ status: false, message: 'Organization not found' });
        }

        return res.status(200).json({ status: true, message: 'Invite code generated', organization: updated[0] });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Error generating invite code', error: error.message });
    }
}

const joinOrganization = async (req, res) => {
    try {
        const { inviteCode } = req.body;
        const userId = req.user.userId;

        if (!inviteCode) {
            return res.status(400).json({ status: false, message: 'inviteCode is required' });
        }

        const orgs = await prisma.$queryRaw`
            SELECT id FROM organizations 
            WHERE invite_code = ${inviteCode} AND invite_code_expires_at > now()
        `;

        if (orgs.length === 0) {
            return res.status(400).json({ status: false, message: 'Invalid or expired invite code' });
        }

        const orgId = orgs[0].id;

        const existingMember = await prisma.organization_members.findUnique({
            where: { organization_id_user_id: { organization_id: orgId, user_id: userId } }
        });
        if (existingMember) {
            return res.status(400).json({ status: false, message: 'You are already a member of this organization' });
        }

        const request = await prisma.organization_join_requests.create({
            data: {
                organization_id: orgId,
                user_id: userId,
                status: 'pending'
            }
        });

        return res.status(201).json({ status: true, message: 'Join request submitted', request });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ status: false, message: 'You already have a pending request for this organization' });
        }
        return res.status(500).json({ status: false, message: 'Error submitting join request', error: error.message });
    }
}

const getJoinRequests = async (req, res) => {
    try {
        const { id } = req.params;
        const requests = await prisma.organization_join_requests.findMany({
            where: { organization_id: id, status: 'pending' },
            include: { users: { select: { id: true, name: true, email: true } } }
        });

        return res.status(200).json({ status: true, message: 'Join requests fetched', requests });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Error fetching requests', error: error.message });
    }
}

const approveJoinRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        const result = await prisma.$transaction(async (tx) => {
            const reqRow = await tx.$queryRaw`
                UPDATE organization_join_requests 
                SET status = 'approved'
                WHERE id = ${requestId}::uuid AND status = 'pending'
                RETURNING organization_id, user_id;
            `;

            if (reqRow.length === 0) {
                throw new Error('NOT_FOUND_OR_NOT_PENDING');
            }

            await tx.organization_members.create({
                data: {
                    organization_id: reqRow[0].organization_id,
                    user_id: reqRow[0].user_id,
                    role: 'co_admin'
                }
            });

            return reqRow[0];
        });

        return res.status(200).json({ status: true, message: 'Join request approved', membership: result });
    } catch (error) {
        if (error.message === 'NOT_FOUND_OR_NOT_PENDING') {
            return res.status(404).json({ status: false, message: 'Request not found or already processed' });
        }
        return res.status(500).json({ status: false, message: 'Error approving request', error: error.message });
    }
}

const rejectJoinRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        const reqRow = await prisma.$queryRaw`
            UPDATE organization_join_requests 
            SET status = 'rejected'
            WHERE id = ${requestId}::uuid AND status = 'pending'
            RETURNING id;
        `;

        if (reqRow.length === 0) {
            return res.status(404).json({ status: false, message: 'Request not found or already processed' });
        }

        return res.status(200).json({ status: true, message: 'Join request rejected' });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Error rejecting request', error: error.message });
    }
}

const editOrganization = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ status: false, message: 'Name is required' });
        }

        const orgRows = await prisma.$queryRaw`
            UPDATE organizations 
            SET name = ${name}
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
        const { id } = req.params;

        await prisma.$transaction(async (tx) => {
            // Delete join requests
            await tx.$queryRaw`DELETE FROM organization_join_requests WHERE organization_id = ${id}::uuid`;
            
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

            // Delete organization members
            await tx.$queryRaw`DELETE FROM organization_members WHERE organization_id = ${id}::uuid`;

            // Delete the organization
            await tx.$queryRaw`DELETE FROM organizations WHERE id = ${id}::uuid`;
        });

        return res.status(200).json({ status: true, message: 'Organization deleted successfully' });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Error deleting organization', error: error.message });
    }
}

const removeCoAdmin = async (req, res) => {
    try {
        const { id, userId } = req.params;

        const result = await prisma.$queryRaw`
            DELETE FROM organization_members
            WHERE organization_id = ${id}::uuid AND user_id = ${userId}::uuid AND role = 'co_admin'
            RETURNING *;
        `;

        if (result.length === 0) {
            return res.status(404).json({ status: false, message: 'Co-Admin not found or could not be removed' });
        }

        return res.status(200).json({ status: true, message: 'Co-Admin removed successfully' });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Error removing Co-Admin', error: error.message });
    }
}

const getMembers = async (req, res) => {
    try {
        const { id } = req.params;
        const members = await prisma.organization_members.findMany({
            where: { organization_id: id },
            include: {
                users: {
                    select: { id: true, name: true, email: true }
                }
            }
        });
        return res.status(200).json({ status: true, members });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Error fetching members', error: error.message });
    }
}

module.exports = {
    createOrganization,
    getMyOrganizations,
    getPendingOrganizations,
    approveOrganization,
    rejectOrganization,
    requestChangesOrganization,
    generateInviteCode,
    joinOrganization,
    getJoinRequests,
    approveJoinRequest,
    rejectJoinRequest,
    editOrganization,
    deleteOrganization,
    removeCoAdmin,
    getMembers,
}