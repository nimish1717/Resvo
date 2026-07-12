const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

const { getAllHalls, createHall } = require('../controllers/halls.controller');

const resolveOrgForHallCreation = (req) => req.body.organizationId;

router.get('/', getAllHalls);
router.post('/', requireAuth, requireRole('org_admin', resolveOrgForHallCreation), createHall);

module.exports = router;
