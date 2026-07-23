const express = require('express');
const router = express.Router();
const { requireAuth, verifySuperAdmin, verifyOrgAdmin } = require('../middleware/auth.middleware');

const {
    getMyOrganization,
    getPendingOrganizations,
    approveOrganization,
    rejectOrganization,
    editOrganization,
    deleteOrganization,
    getMyActivities,
} = require('../controllers/organizations.controller');

// Super Admin routes
router.get('/pending', requireAuth, verifySuperAdmin, getPendingOrganizations);
router.post('/:id/approve', requireAuth, verifySuperAdmin, approveOrganization);
router.post('/:id/reject', requireAuth, verifySuperAdmin, rejectOrganization);

// Org Admin routes (uses req.organization from verifyOrgAdmin)
router.get('/mine', requireAuth, verifyOrgAdmin, getMyOrganization);
router.get('/mine/activities', requireAuth, verifyOrgAdmin, getMyActivities);
router.put('/mine', requireAuth, verifyOrgAdmin, editOrganization);
router.delete('/mine', requireAuth, verifyOrgAdmin, deleteOrganization);

module.exports = router;