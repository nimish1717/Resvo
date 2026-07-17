const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const { getAllHalls, createHall, searchHalls, getHallById, updateHall, deleteHall } = require('../controllers/halls.controller');
const prisma = require('../lib/prismaClient');

const resolveOrgForHallCreation = (req) => req.body.organizationId;
const resolveOrgFromHallId = async (req) => {
    const result = await prisma.$queryRaw`SELECT organization_id FROM halls WHERE id = ${req.params.id}::uuid`;
    return result[0]?.organization_id;
};

router.get('/search', searchHalls);
router.get('/', getAllHalls);
router.get('/:id', getHallById);
router.post('/', requireAuth, upload.array('photos', 2), requireRole('org_admin', resolveOrgForHallCreation), createHall);
router.put('/:id', requireAuth, upload.array('photos', 2), requireRole('org_admin', resolveOrgFromHallId), updateHall);
router.delete('/:id', requireAuth, requireRole('org_admin', resolveOrgFromHallId), deleteHall);

module.exports = router;
