const prisma = require('../lib/prismaClient');
const redis = require('../lib/redisClient');
const { invalidateSearchCache } = require('../lib/cache');
const { findSameHallSameDaySlots, findDifferentHallSameTime, findSameHallNextDays } = require('../utils/suggestionLogic');

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
            SELECT id, hall_id, requested_by, status, time_range::text, response_deadline, created_at, superseded_by, reason, suggestion_round
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

const getMyBookings = async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await prisma.$queryRaw`
            SELECT b.id, b.status, b.time_range::text, b.created_at, h.name as hall_name, h.id as hall_id
            FROM bookings b
            JOIN halls h ON b.hall_id = h.id
            WHERE b.requested_by = ${userId}::uuid
            ORDER BY b.created_at DESC;
        `;
        return res.status(200).json({
            status: true,
            bookings: result
        });
    } catch (error) {
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

        // Invalidate search cache because availability changed
        await invalidateSearchCache();

        res.status(200).json({ status: true, message: 'Booking approved', booking });
    } catch (error) {
        if (error.code === 'P2010' && error.meta?.code === '23P01') {
            await prisma.$executeRaw`
                UPDATE bookings SET status = 'conflicted' WHERE id = ${req.params.id}::uuid;
            `;
            return res.status(409).json({
                status: false,
                message: 'conflict — check /suggestions',
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

const getSuggestions = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const bookings = await prisma.$queryRaw`
            SELECT b.id, b.hall_id, b.requested_by, b.suggestion_round, h.organization_id, 
                   lower(b.time_range) as start_time, upper(b.time_range) as end_time
            FROM bookings b
            JOIN halls h ON b.hall_id = h.id
            WHERE b.id = ${id}::uuid;
        `;
        if (bookings.length === 0) return res.status(404).json({ status: false, message: 'Booking not found' });
        const booking = bookings[0];

        if (booking.requested_by !== userId) {
            return res.status(403).json({ status: false, message: 'Only the original requester can view suggestions' });
        }

        if (booking.suggestion_round >= 2) {
            return res.status(400).json({ status: false, message: 'no more suggestions, browse manually' });
        }

        let suggestions = [];

        // Rule 1: Same day, same hall (using robust JS gap-finding helper)
        suggestions = await findSameHallSameDaySlots(booking.hall_id, booking.start_time, booking.end_time);

        // Rule 2: Same hall, next 3 days
        if (suggestions.length === 0) {
            suggestions = await findSameHallNextDays(booking.hall_id, booking.start_time, booking.end_time);
        }

        // Rule 3: Same time, different hall in same org (Cross-hall, Last Resort)
        if (suggestions.length === 0) {
            // Need the organization_id for this hall
            const hallData = await prisma.halls.findUnique({ where: { id: booking.hall_id } });
            suggestions = await findDifferentHallSameTime(hallData.organization_id, booking.hall_id, booking.start_time, booking.end_time);
        }

        if (suggestions.length === 0) {
            return res.status(200).json({ status: true, message: 'No suggestions available', suggestions: [] });
        }

        // Attach hall_name to suggestions
        const hallIds = [...new Set(suggestions.map(s => s.hall_id))];
        const halls = await prisma.halls.findMany({
            where: { id: { in: hallIds } },
            select: { id: true, name: true }
        });
        const hallNameMap = halls.reduce((acc, h) => {
            acc[h.id] = h.name;
            return acc;
        }, {});

        suggestions = suggestions.map(s => ({
            ...s,
            hall_name: hallNameMap[s.hall_id] || 'Unknown Hall'
        }));

        // Save suggestions to Redis with a 5-minute TTL (300 seconds)
        const cacheKey = `holds:booking:${id}`;
        await redis.set(cacheKey, JSON.stringify(suggestions), 'EX', 300);

        return res.status(200).json({ status: true, suggestions });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Error generating suggestions', error: error.message });
    }
}

const acceptSuggestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { hallId, startTime, endTime } = req.body;
        const userId = req.user.userId;

        const bookings = await prisma.$queryRaw`SELECT id, requested_by, suggestion_round FROM bookings WHERE id = ${id}::uuid`;
        if (bookings.length === 0) return res.status(404).json({ status: false, message: 'Booking not found' });
        const originalBooking = bookings[0];

        if (originalBooking.requested_by !== userId) {
            return res.status(403).json({ status: false, message: 'Forbidden' });
        }

        // Validate suggestion hold against Redis
        const cacheKey = `holds:booking:${id}`;
        const holdsStr = await redis.get(cacheKey);
        const holds = holdsStr ? JSON.parse(holdsStr) : [];
        
        const validHold = holds.find(h => 
            h.hall_id === hallId && 
            new Date(h.start_time).getTime() === new Date(startTime).getTime() && 
            new Date(h.end_time).getTime() === new Date(endTime).getTime()
        );

        if (!validHold) {
            return res.status(400).json({ status: false, message: 'Suggestion hold expired or invalid' });
        }

        const newBookingRound = originalBooking.suggestion_round + 1;

        const newBooking = await prisma.$transaction(async (tx) => {
            const nb = await tx.$queryRaw`
                INSERT INTO bookings (hall_id, requested_by, status, time_range, suggestion_round)
                VALUES (${hallId}::uuid, ${userId}::uuid, 'requested', tstzrange(${startTime}::timestamptz, ${endTime}::timestamptz), ${newBookingRound})
                RETURNING id;
            `;
            const newId = nb[0].id;

            await tx.$queryRaw`
                UPDATE bookings 
                SET status = 'rejected', reason = 'superseded', superseded_by = ${newId}::uuid
                WHERE id = ${id}::uuid;
            `;

            return newId;
        });

        return res.status(200).json({ status: true, message: 'Suggestion accepted, new booking created', newBookingId: newBooking });
    } catch (error) {
        return res.status(500).json({ status: false, error: error.message });
    }
}

const declineSuggestions = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const bookings = await prisma.$queryRaw`SELECT id, requested_by FROM bookings WHERE id = ${id}::uuid`;
        if (bookings.length === 0) return res.status(404).json({ status: false, message: 'Booking not found' });
        const originalBooking = bookings[0];

        if (originalBooking.requested_by !== userId) {
            return res.status(403).json({ status: false, message: 'Forbidden' });
        }

        await prisma.$queryRaw`
            UPDATE bookings 
            SET status = 'rejected', reason = 'no_suggestion_accepted'
            WHERE id = ${id}::uuid;
        `;

        return res.status(200).json({ status: true, message: 'Suggestions declined and booking rejected' });
    } catch (error) {
        return res.status(500).json({ status: false, error: error.message });
    }
}

const checkInBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const actingUserId = req.user.userId;

        const booking = await prisma.$transaction(async (tx) => {
            const updated = await tx.$queryRaw`
                UPDATE bookings
                SET status = 'checked_in'
                WHERE id = ${id}::uuid AND status = 'approved'
                RETURNING id, hall_id, requested_by, status, time_range::text;
            `;

            if (updated.length === 0) {
                throw new Error('BOOKING_NOT_FOUND_OR_NOT_APPROVED');
            }

            await tx.$executeRaw`
                INSERT INTO booking_actions (booking_id, acting_user_id, action)
                VALUES (${id}::uuid, ${actingUserId}::uuid, 'checked_in');
            `;

            return updated[0];
        });

        res.status(200).json({ status: true, message: 'Booking checked in', booking });
    } catch (error) {
        if (error.message === 'BOOKING_NOT_FOUND_OR_NOT_APPROVED') {
            return res.status(404).json({
                status: false,
                message: 'Booking not found, or it is not in approved state',
            });
        }
        return res.status(500).json({
            status: false,
            message: 'Something went wrong while checking in the booking',
            error: error.message
        });
    }
}

const noShowBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const actingUserId = req.user.userId;

        const booking = await prisma.$transaction(async (tx) => {
            const updated = await tx.$queryRaw`
                UPDATE bookings
                SET status = 'no_show'
                WHERE id = ${id}::uuid AND status = 'approved'
                RETURNING id, hall_id, requested_by, status, time_range::text;
            `;

            if (updated.length === 0) {
                throw new Error('BOOKING_NOT_FOUND_OR_NOT_APPROVED');
            }

            await tx.$executeRaw`
                INSERT INTO booking_actions (booking_id, acting_user_id, action)
                VALUES (${id}::uuid, ${actingUserId}::uuid, 'no_show');
            `;

            return updated[0];
        });

        await invalidateSearchCache();

        res.status(200).json({ status: true, message: 'Booking marked as no-show', booking });
    } catch (error) {
        if (error.message === 'BOOKING_NOT_FOUND_OR_NOT_APPROVED') {
            return res.status(404).json({
                status: false,
                message: 'Booking not found, or it is not in approved state',
            });
        }
        return res.status(500).json({
            status: false,
            message: 'Something went wrong while marking as no-show',
            error: error.message
        });
    }
}

const completeBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const actingUserId = req.user.userId;

        const booking = await prisma.$transaction(async (tx) => {
            const updated = await tx.$queryRaw`
                UPDATE bookings
                SET status = 'completed'
                WHERE id = ${id}::uuid AND status IN ('approved', 'checked_in')
                RETURNING id, hall_id, requested_by, status, time_range::text;
            `;

            if (updated.length === 0) {
                throw new Error('BOOKING_NOT_FOUND_OR_NOT_VALID_STATE');
            }

            await tx.$executeRaw`
                INSERT INTO booking_actions (booking_id, acting_user_id, action)
                VALUES (${id}::uuid, ${actingUserId}::uuid, 'completed');
            `;

            return updated[0];
        });

        await invalidateSearchCache();

        res.status(200).json({ status: true, message: 'Booking completed', booking });
    } catch (error) {
        if (error.message === 'BOOKING_NOT_FOUND_OR_NOT_VALID_STATE') {
            return res.status(404).json({
                status: false,
                message: 'Booking not found, or it is not in approved or checked_in state',
            });
        }
        return res.status(500).json({
            status: false,
            message: 'Something went wrong while completing the booking',
            error: error.message
        });
    }
}

const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const actingUserId = req.user.userId;

        const booking = await prisma.$transaction(async (tx) => {
            const updated = await tx.$queryRaw`
                UPDATE bookings
                SET status = 'cancelled'
                WHERE id = ${id}::uuid AND status IN ('requested', 'approved', 'checked_in')
                RETURNING id, hall_id, requested_by, status, time_range::text;
            `;

            if (updated.length === 0) {
                throw new Error('BOOKING_NOT_FOUND_OR_NOT_VALID_STATE');
            }

            await tx.$executeRaw`
                INSERT INTO booking_actions (booking_id, acting_user_id, action)
                VALUES (${id}::uuid, ${actingUserId}::uuid, 'cancelled');
            `;

            return updated[0];
        });

        await invalidateSearchCache();

        res.status(200).json({ status: true, message: 'Booking cancelled', booking });
    } catch (error) {
        if (error.message === 'BOOKING_NOT_FOUND_OR_NOT_VALID_STATE') {
            return res.status(404).json({
                status: false,
                message: 'Booking not found, or it is already in a terminal state',
            });
        }
        return res.status(500).json({
            status: false,
            message: 'Something went wrong while cancelling the booking',
            error: error.message
        });
    }
}

module.exports = {
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
}