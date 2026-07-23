const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');

const { requireAuth, verifyOrgAdmin } = require('../middleware/auth.middleware');

router.get('/', statsController.getStats);
router.get('/organization/overview', requireAuth, verifyOrgAdmin, statsController.getOrgOverview);
router.get('/organization/analytics', requireAuth, verifyOrgAdmin, statsController.getOrgAnalytics);

module.exports = router;
