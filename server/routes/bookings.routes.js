const express = require('express');
const router = express.Router();

const {
    createBooking,
    getBookingById,
    getBookingsByHall,
    approveBooking,
    rejectBooking,
} = require('../controllers/bookings.controller');

router.post('/', createBooking);

router.get('/hall/:hallId', getBookingsByHall);

router.get('/:id', getBookingById);

router.post('/:id/approve', approveBooking);

router.post('/:id/reject', rejectBooking);

module.exports = router;