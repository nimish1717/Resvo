const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

const prisma = require('../lib/prismaClient');

const {
    createOrganization,
    getPendingOrganizations,
    approveOrganization,
    rejectOrganization,
    requestChangesOrganization,
    generateInviteCode,
    joinOrganization,
    getJoinRequests,
    approveJoinRequest,
    rejectJoinRequest,
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
router.get('/pending', requireAuth, requireRole('super_admin'), getPendingOrganizations);
router.post('/:id/approve', requireAuth, requireRole('super_admin'), approveOrganization);
router.post('/:id/reject', requireAuth, requireRole('super_admin'), rejectOrganization);
router.post('/:id/request-changes', requireAuth, requireRole('super_admin'), requestChangesOrganization);

router.post('/:id/invite-code', requireAuth, requireRole('org_admin', resolveOrgFromParams), generateInviteCode);
router.post('/join', requireAuth, joinOrganization);
router.get('/:id/join-requests', requireAuth, requireRole('org_admin', resolveOrgFromParams), getJoinRequests);
router.post('/join-requests/:requestId/approve', requireAuth, requireRole('org_admin', resolveOrgFromRequestId), approveJoinRequest);
router.post('/join-requests/:requestId/reject', requireAuth, requireRole('org_admin', resolveOrgFromRequestId), rejectJoinRequest);

module.exports = router;