const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

const {
    createOrganization,
    getPendingOrganizations,
    approveOrganization,
    rejectOrganization,
    requestChangesOrganization,
} = require('../controllers/organizations.controller');

router.post('/', requireAuth, createOrganization);
router.get('/pending', requireAuth, requireRole('super_admin'), getPendingOrganizations);
router.post('/:id/approve', requireAuth, requireRole('super_admin'), approveOrganization);
router.post('/:id/reject', requireAuth, requireRole('super_admin'), rejectOrganization);
router.post('/:id/request-changes', requireAuth, requireRole('super_admin'), requestChangesOrganization);

module.exports = router;