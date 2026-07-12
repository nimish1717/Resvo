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

        // Rule 1: Same day, same hall (try +2 hours, +4 hours)
        const r1 = await prisma.$queryRaw`
            WITH candidates AS (
                SELECT ${booking.hall_id}::uuid AS hall_id,
                       (${booking.start_time}::timestamptz + interval '2 hours') AS start_time,
                       (${booking.end_time}::timestamptz + interval '2 hours') AS end_time
                UNION ALL
                SELECT ${booking.hall_id}::uuid,
                       (${booking.start_time}::timestamptz + interval '4 hours'),
                       (${booking.end_time}::timestamptz + interval '4 hours')
            )
            SELECT c.* FROM candidates c
            WHERE NOT EXISTS (
                SELECT 1 FROM bookings b
                WHERE b.hall_id = c.hall_id
                AND b.status IN ('approved', 'active')
                AND b.time_range && tstzrange(c.start_time, c.end_time)
            )
            LIMIT 2;
        `;
        if (r1.length > 0) suggestions = r1;

        // Rule 2: Same time, different hall in same org
        if (suggestions.length === 0) {
            const r2 = await prisma.$queryRaw`
                SELECT h.id as hall_id, ${booking.start_time}::timestamptz as start_time, ${booking.end_time}::timestamptz as end_time
                FROM halls h
                WHERE h.organization_id = ${booking.organization_id}::uuid
                AND h.id != ${booking.hall_id}::uuid
                AND NOT EXISTS (
                    SELECT 1 FROM bookings b
                    WHERE b.hall_id = h.id
                    AND b.status IN ('approved', 'active')
                    AND b.time_range && tstzrange(${booking.start_time}::timestamptz, ${booking.end_time}::timestamptz)
                )
                LIMIT 2;
            `;
            if (r2.length > 0) suggestions = r2;
        }

        // Rule 3: Next 3 days, same hall, same time
        if (suggestions.length === 0) {
            const r3 = await prisma.$queryRaw`
                WITH candidates AS (
                    SELECT ${booking.hall_id}::uuid AS hall_id,
                           (${booking.start_time}::timestamptz + interval '1 day') AS start_time,
                           (${booking.end_time}::timestamptz + interval '1 day') AS end_time
                    UNION ALL
                    SELECT ${booking.hall_id}::uuid,
                           (${booking.start_time}::timestamptz + interval '2 days'),
                           (${booking.end_time}::timestamptz + interval '2 days')
                )
                SELECT c.* FROM candidates c
                WHERE NOT EXISTS (
                    SELECT 1 FROM bookings b
                    WHERE b.hall_id = c.hall_id
                    AND b.status IN ('approved', 'active')
                    AND b.time_range && tstzrange(c.start_time, c.end_time)
                )
                LIMIT 2;
            `;
            if (r3.length > 0) suggestions = r3;
        }

        if (suggestions.length === 0) {
            return res.status(200).json({ status: true, message: 'No suggestions available', suggestions: [] });
        }

        for (const sugg of suggestions) {
            await prisma.$queryRaw`
                INSERT INTO suggestion_holds (hall_id, time_range, held_for_booking_id)
                VALUES (${sugg.hall_id}::uuid, tstzrange(${sugg.start_time}::timestamptz, ${sugg.end_time}::timestamptz), ${id}::uuid)
            `;
        }

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

        const bookings = await prisma.$queryRaw`SELECT * FROM bookings WHERE id = ${id}::uuid`;
        if (bookings.length === 0) return res.status(404).json({ status: false, message: 'Booking not found' });
        const originalBooking = bookings[0];

        if (originalBooking.requested_by !== userId) {
            return res.status(403).json({ status: false, message: 'Forbidden' });
        }

        const holds = await prisma.$queryRaw`
            SELECT id FROM suggestion_holds 
            WHERE held_for_booking_id = ${id}::uuid 
            AND hall_id = ${hallId}::uuid 
            AND time_range = tstzrange(${startTime}::timestamptz, ${endTime}::timestamptz)
            AND expires_at > now()
        `;

        if (holds.length === 0) {
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

        const bookings = await prisma.$queryRaw`SELECT * FROM bookings WHERE id = ${id}::uuid`;
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

module.exports = {
    createBooking,
    getBookingById,
    getBookingsByHall,
    approveBooking,
    rejectBooking,
    getSuggestions,
    acceptSuggestion,
    declineSuggestions
}