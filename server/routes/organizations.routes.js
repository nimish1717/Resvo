const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

const prisma = require('../lib/prismaClient');

const {
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
} = require('../controllers/organizations.controller');

const resolveOrgFromParams = (req) => req.params.id;
const resolveOrgFromRequestId = async (req) => {
    const result = await prisma.$queryRaw`
        SELECT organization_id 
        FROM organization_join_requests 
        WHERE id = ${req.params.requestId}::uuid
    `;
    return result[0]?.organization_id;
};

router.post('/', requireAuth, createOrganization);
router.get('/mine', requireAuth, getMyOrganizations);
router.get('/pending', requireAuth, requireRole('super_admin'), getPendingOrganizations);
router.post('/:id/approve', requireAuth, requireRole('super_admin'), approveOrganization);
router.post('/:id/reject', requireAuth, requireRole('super_admin'), rejectOrganization);
router.post('/:id/request-changes', requireAuth, requireRole('super_admin'), requestChangesOrganization);

router.put('/:id', requireAuth, requireRole('org_owner', resolveOrgFromParams), editOrganization);
router.delete('/:id', requireAuth, requireRole('org_owner', resolveOrgFromParams), deleteOrganization);
router.delete('/:id/co-admin/:userId', requireAuth, requireRole('org_owner', resolveOrgFromParams), removeCoAdmin);

router.post('/:id/invite-code', requireAuth, requireRole('org_owner', resolveOrgFromParams), generateInviteCode);
router.post('/join', requireAuth, joinOrganization);
router.get('/:id/join-requests', requireAuth, requireRole('org_owner', resolveOrgFromParams), getJoinRequests);
router.post('/join-requests/:requestId/approve', requireAuth, requireRole('org_owner', resolveOrgFromRequestId), approveJoinRequest);
router.post('/join-requests/:requestId/reject', requireAuth, requireRole('org_owner', resolveOrgFromRequestId), rejectJoinRequest);
router.get('/:id/members', requireAuth, requireRole('org_owner', resolveOrgFromParams), getMembers);

module.exports = router;