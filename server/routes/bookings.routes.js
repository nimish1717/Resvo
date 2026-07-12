const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const prisma = require('../lib/prismaClient');

const {
    createBooking,
    getBookingById,
    getBookingsByHall,
    approveBooking,
    rejectBooking,
    getSuggestions,
    acceptSuggestion,
    declineSuggestions,
} = require('../controllers/bookings.controller');

const resolveOrgFromBookingId = async (req) => {
    const result = await prisma.$queryRaw`
        SELECT h.organization_id 
        FROM bookings b 
        JOIN halls h ON b.hall_id = h.id 
        WHERE b.id = ${req.params.id}::uuid
    `;
    return result[0]?.organization_id;
};

router.post('/', requireAuth, createBooking);

router.get('/hall/:hallId', requireAuth, getBookingsByHall);

router.get('/:id', requireAuth, getBookingById);

router.post('/:id/approve', requireAuth, requireRole('org_admin', resolveOrgFromBookingId), approveBooking);

router.post('/:id/reject', requireAuth, requireRole('org_admin', resolveOrgFromBookingId), rejectBooking);

router.get('/:id/suggestions', requireAuth, getSuggestions);
router.post('/:id/accept-suggestion', requireAuth, acceptSuggestion);
router.post('/:id/decline-suggestions', requireAuth, declineSuggestions);

module.exports = router;