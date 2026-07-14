const prisma = require('../lib/prismaClient');

/**
 * Finds available gaps for a specific hall on a specific day.
 * Assumes the bookable hours are between 08:00 and 22:00.
 */
const findSameHallSameDaySlots = async (hallId, requestedStartTime, requestedEndTime) => {
    const reqStart = new Date(requestedStartTime);
    const reqEnd = new Date(requestedEndTime);
    
    const durationMs = reqEnd.getTime() - reqStart.getTime();
    
    // Set bookable window (08:00 to 22:00 in UTC for simplicity; in a real app this would use the hall's timezone)
    const dayStart = new Date(reqStart);
    dayStart.setUTCHours(8, 0, 0, 0);
    
    const dayEnd = new Date(reqStart);
    dayEnd.setUTCHours(22, 0, 0, 0);

    // Query all active/approved bookings for that hall on that day
    const overlapping = await prisma.$queryRaw`
        SELECT lower(time_range) as start_time, upper(time_range) as end_time
        FROM bookings
        WHERE hall_id = ${hallId}::uuid
        AND status IN ('approved', 'checked_in')
        AND time_range && tstzrange(${dayStart.toISOString()}::timestamptz, ${dayEnd.toISOString()}::timestamptz)
        ORDER BY start_time ASC
    `;
    
    const availableSlots = [];
    let currentMarker = dayStart.getTime();
    
    for (const b of overlapping) {
        const bStart = new Date(b.start_time).getTime();
        const bEnd = new Date(b.end_time).getTime();
        
        // If there's a gap between currentMarker and this booking's start
        if (bStart - currentMarker >= durationMs) {
            availableSlots.push({
                hall_id: hallId,
                start_time: new Date(currentMarker).toISOString(),
                end_time: new Date(currentMarker + durationMs).toISOString()
            });
        }
        // Move marker to the end of this booking (if it's further than current marker)
        if (bEnd > currentMarker) {
            currentMarker = bEnd;
        }
    }
    
    // Check the final gap after the last booking until the end of the day
    if (dayEnd.getTime() - currentMarker >= durationMs) {
        availableSlots.push({
            hall_id: hallId,
            start_time: new Date(currentMarker).toISOString(),
            end_time: new Date(currentMarker + durationMs).toISOString()
        });
    }
    
    return availableSlots;
};

const findDifferentHallSameTime = async (organizationId, originalHallId, requestedStartTime, requestedEndTime) => {
    // Find halls in the same org that are free for exactly requestedStartTime to requestedEndTime
    const reqStart = new Date(requestedStartTime).toISOString();
    const reqEnd = new Date(requestedEndTime).toISOString();

    const halls = await prisma.$queryRaw`
        SELECT h.id as hall_id
        FROM halls h
        WHERE h.organization_id = ${organizationId}::uuid
        AND h.id != ${originalHallId}::uuid
        AND NOT EXISTS (
            SELECT 1 FROM bookings b
            WHERE b.hall_id = h.id
            AND b.status IN ('approved', 'checked_in')
            AND b.time_range && tstzrange(${reqStart}::timestamptz, ${reqEnd}::timestamptz)
        )
        LIMIT 2;
    `;
    
    return halls.map(h => ({
        hall_id: h.hall_id,
        start_time: reqStart,
        end_time: reqEnd
    }));
};

const findSameHallNextDays = async (hallId, requestedStartTime, requestedEndTime) => {
    const start = new Date(requestedStartTime);
    const end = new Date(requestedEndTime);
    
    const candidates = [];
    // Shift by 1, 2, 3 days
    for (let i = 1; i <= 3; i++) {
        const cStart = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
        const cEnd = new Date(end.getTime() + i * 24 * 60 * 60 * 1000);
        candidates.push({ start: cStart, end: cEnd });
    }
    
    const available = [];
    for (const c of candidates) {
        const overlap = await prisma.$queryRaw`
            SELECT 1 FROM bookings
            WHERE hall_id = ${hallId}::uuid
            AND status IN ('approved', 'checked_in')
            AND time_range && tstzrange(${c.start.toISOString()}::timestamptz, ${c.end.toISOString()}::timestamptz)
            LIMIT 1
        `;
        if (overlap.length === 0) {
            available.push({
                hall_id: hallId,
                start_time: c.start.toISOString(),
                end_time: c.end.toISOString()
            });
            if (available.length >= 2) break;
        }
    }
    return available;
};

module.exports = {
    findSameHallSameDaySlots,
    findDifferentHallSameTime,
    findSameHallNextDays
};
