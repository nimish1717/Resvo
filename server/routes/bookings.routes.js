const express = require('express');
const router = express.Router();
const { requireAuth, verifyOrgAdmin, verifyApprovedOrgAdmin } = require('../middleware/auth.middleware');

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
    getMyBookings,
    simulatePayment
} = require('../controllers/bookings.controller');

router.get('/', requireAuth, getMyBookings);
router.post('/', requireAuth, createBooking);
router.get('/hall/:hallId', requireAuth, getBookingsByHall);
router.get('/:id', requireAuth, getBookingById);

// Org Admin Routes
router.post('/:id/approve', requireAuth, verifyOrgAdmin, verifyApprovedOrgAdmin, approveBooking);
router.post('/:id/reject', requireAuth, verifyOrgAdmin, verifyApprovedOrgAdmin, rejectBooking);
router.post('/:id/check-in', requireAuth, verifyOrgAdmin, verifyApprovedOrgAdmin, checkInBooking);
router.post('/:id/no-show', requireAuth, verifyOrgAdmin, verifyApprovedOrgAdmin, noShowBooking);
router.post('/:id/complete', requireAuth, verifyOrgAdmin, verifyApprovedOrgAdmin, completeBooking);

// User Routes
router.get('/:id/suggestions', requireAuth, getSuggestions);
router.post('/:id/accept-suggestion', requireAuth, acceptSuggestion);
router.post('/:id/decline-suggestions', requireAuth, declineSuggestions);
router.post('/:id/cancel', requireAuth, cancelBooking);
router.post('/:id/pay', requireAuth, simulatePayment);

module.exports = router;