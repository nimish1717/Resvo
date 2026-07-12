const prisma = require('../lib/prismaClient');

const createBooking = async (req, res) => {
    try {
        const { hallId, startTime, endTime } = req.body;
        const requestedBy = req.user.userId;
        
        if (!hallId || !startTime || !endTime) {
            return res.status(400).json({
                status: false,
                message: 'hallId, startTime, and endTime are all required',
            });

        }
        if (new Date(startTime) >= new Date(endTime)) {
            return res.status(400).json({
                status: false,
                message: 'startTime must be before endTime'
            });
        }
        const hall = await prisma.halls.findUnique({ where: { id: hallId } });
        if (!hall) {
            return res.status(404).json({
                status: false,
                message: 'Hall not found'
            });
        }
        const result = await prisma.$queryRaw`
            INSERT INTO bookings (hall_id, requested_by, status, time_range)
                VALUES (
                ${hallId}::uuid,
                ${requestedBy}::uuid,
                'requested',
                tstzrange(${startTime}::timestamptz, ${endTime}::timestamptz)
            )
            RETURNING id, hall_id, requested_by, status, time_range::text, created_at;
        `;
        res.status(201).json({
            status: true,
            message: 'Booking done',
            booking: result[0]
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}
const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await prisma.$queryRaw`
            SELECT id, hall_id, requested_by, status, time_range::text, response_deadline, created_at
            FROM bookings
            WHERE id = ${id}::uuid;
        `;

        if (result.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Booking not found'
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Booking fetched successfully',
            booking: result[0]
        });

    } catch (error) {
        console.error('Error fetching booking by id:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}
const getBookingsByHall = async (req, res) => {
    try {
        const { hallId } = req.params;
        const result = await prisma.$queryRaw`
            SELECT id, hall_id, requested_by, status, time_range::text, created_at
            FROM bookings
            WHERE hall_id = ${hallId}::uuid
            ORDER BY created_at DESC;
        `;

        return res.status(200).json({
            status: true,
            message: 'Bookings fetched successfully',
            bookings: result
        });

    } catch (error) {
        console.error('Error fetching bookings by hall:', error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}
const approveBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const actingUserId = req.user.userId;

        const booking = await prisma.$transaction(async (tx) => {
            const updated = await tx.$queryRaw`
                UPDATE bookings
                SET status = 'approved'
                WHERE id = ${id}::uuid AND status = 'requested'
                RETURNING id, hall_id, requested_by, status, time_range::text;
            `;

            if (updated.length === 0) {
                throw new Error('BOOKING_NOT_FOUND_OR_NOT_PENDING');
            }

            await tx.$executeRaw`
                INSERT INTO booking_actions (booking_id, acting_user_id, action)
                VALUES (${id}::uuid, ${actingUserId}::uuid, 'approved');
            `;

            return updated[0];
        });

        res.status(200).json({ status: true, message: 'Booking approved', booking });
    } catch (error) {
        if (error.code === 'P2010' && error.meta?.code === '23P01') {
            await prisma.$executeRaw`
                UPDATE bookings SET status = 'conflicted' WHERE id = ${req.params.id}::uuid;
            `;
            return res.status(409).json({
                status: false,
                message: 'This slot was already booked by someone else',
                bookingId: req.params.id,
            });
        }

        if (error.message === 'BOOKING_NOT_FOUND_OR_NOT_PENDING') {
            return res.status(404).json({
                status: false,
                message: 'Booking not found, or it is not in a requested state',
            });
        }
        return res.status(500).json({
            status: false,
            message: 'Something went wrong while approving the booking',
            error: error.message
        });
    }
}
const rejectBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const actingUserId = req.user.userId;

        const booking = await prisma.$transaction(async (tx) => {
            const updated = await tx.$queryRaw`
                UPDATE bookings
                SET status = 'rejected'
                WHERE id = ${id}::uuid AND status = 'requested'
                RETURNING id, hall_id, requested_by, status, time_range::text;
            `;

            if (updated.length === 0) {
                throw new Error('BOOKING_NOT_FOUND_OR_NOT_PENDING');
            }

            await tx.$executeRaw`
                INSERT INTO booking_actions (booking_id, acting_user_id, action)
                VALUES (${id}::uuid, ${actingUserId}::uuid, 'rejected');
            `;

            return updated[0];
        });

        res.status(200).json({ status: true, message: 'Booking rejected', booking });
    } catch (error) {
        if (error.message === 'BOOKING_NOT_FOUND_OR_NOT_PENDING') {
            return res.status(404).json({
                status: false,
                message: 'Booking not found, or it is not in a requested state',
            });
        }

        console.error('Error rejecting booking:', error);
        return res.status(500).json({
            status: false,
            message: 'Something went wrong while rejecting the booking',
            error: error.message
        });
    }
}

module.exports = {
    createBooking,
    getBookingById,
    getBookingsByHall,
    approveBooking,
    rejectBooking
}