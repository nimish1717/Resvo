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
    checkInBooking,
    noShowBooking,
    completeBooking,
    cancelBooking,
    getMyBookings
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

router.get('/', requireAuth, getMyBookings);

router.post('/', requireAuth, createBooking);

router.get('/hall/:hallId', requireAuth, getBookingsByHall);

router.get('/:id', requireAuth, getBookingById);

router.post('/:id/approve', requireAuth, requireRole('org_admin', resolveOrgFromBookingId), approveBooking);

router.post('/:id/reject', requireAuth, requireRole('org_admin', resolveOrgFromBookingId), rejectBooking);

router.get('/:id/suggestions', requireAuth, getSuggestions);
router.post('/:id/accept-suggestion', requireAuth, acceptSuggestion);
router.post('/:id/decline-suggestions', requireAuth, declineSuggestions);

router.post('/:id/check-in', requireAuth, requireRole('org_admin', resolveOrgFromBookingId), checkInBooking);
router.post('/:id/no-show', requireAuth, requireRole('org_admin', resolveOrgFromBookingId), noShowBooking);
router.post('/:id/complete', requireAuth, requireRole('org_admin', resolveOrgFromBookingId), completeBooking);
router.post('/:id/cancel', requireAuth, requireRole('org_admin', resolveOrgFromBookingId), cancelBooking);

module.exports = router;