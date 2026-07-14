const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

const { getAllHalls, createHall, searchHalls, getHallById } = require('../controllers/halls.controller');

const resolveOrgForHallCreation = (req) => req.body.organizationId;

router.get('/search', searchHalls);
router.get('/', getAllHalls);
router.get('/:id', getHallById);
router.post('/', requireAuth, requireRole('org_admin', resolveOrgForHallCreation), createHall);

module.exports = router;
