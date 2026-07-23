const express = require('express');
const router = express.Router();
const { requireAuth, verifySuperAdmin } = require('../middleware/auth.middleware');
const {
    getAllUsers,
    getAllOrganizations,
    getPendingHalls,
    updateHallStatus,
    updateOrganizationStatus,
    getAdminStats
} = require('../controllers/admin.controller');

// All routes require SUPER_ADMIN
router.use(requireAuth);
router.use(verifySuperAdmin);

router.get('/users', getAllUsers);
router.get('/organizations', getAllOrganizations);
router.post('/organizations/:id/:action', updateOrganizationStatus);
router.get('/halls/pending', getPendingHalls);
router.post('/halls/:id/:action', updateHallStatus);
router.get('/stats', getAdminStats);

module.exports = router;
