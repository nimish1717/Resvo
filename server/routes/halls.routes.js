const express = require('express');
const router = express.Router();
const { requireAuth, verifyOrgAdmin, verifyApprovedOrgAdmin } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const { getAllHalls, createHall, searchHalls, getHallById, updateHall, deleteHall } = require('../controllers/halls.controller');

router.get('/search', searchHalls);
router.get('/', getAllHalls);
router.get('/:id', getHallById);

// Organizer routes
router.post('/', requireAuth, verifyOrgAdmin, verifyApprovedOrgAdmin, upload.array('photos', 2), createHall);
router.put('/:id', requireAuth, verifyOrgAdmin, verifyApprovedOrgAdmin, upload.array('photos', 2), updateHall);
router.delete('/:id', requireAuth, verifyOrgAdmin, verifyApprovedOrgAdmin, deleteHall);

module.exports = router;
