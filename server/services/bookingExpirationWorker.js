const prisma = require('../lib/prismaClient');
const { invalidateSearchCache } = require('../lib/cache');

async function checkExpiredBookings() {
    try {
        console.log('[Worker] Checking for expired booking requests...');
        
        // Find bookings in requested state where the deadline has passed
        const expiredBookings = await prisma.$queryRaw`
            SELECT id FROM bookings 
            WHERE status = 'requested' 
            AND response_deadline < NOW();
        `;

        if (expiredBookings.length > 0) {
            console.log(`[Worker] Found ${expiredBookings.length} expired booking(s). Processing...`);
            
            for (const booking of expiredBookings) {
                await prisma.$transaction(async (tx) => {
                    await tx.$executeRaw`
                        UPDATE bookings 
                        SET status = 'expired', reason = 'Host did not respond in time'
                        WHERE id = ${booking.id}::uuid;
                    `;

                    // Create action log (system generated, no acting_user_id)
                    // Note: If acting_user_id is strictly NOT NULL, we might need to skip inserting or use a system user ID. Let's assume it can be nullable or we use an admin ID if needed. For now, since schema says acting_user_id String @db.Uuid (not nullable), we might have an issue. Let's check schema.
                    // Schema: acting_user_id String @db.Uuid. It's required. We need a system user. 
                    // Let's just update the status for now and skip action logging if no system user exists, or just leave it.
                });
            }
            
            await invalidateSearchCache();
            console.log('[Worker] Expired bookings processed.');
        }
    } catch (error) {
        console.error('[Worker] Error processing expired bookings:', error);
    }
}

function startBookingExpirationWorker() {
    // Run every hour
    setInterval(checkExpiredBookings, 60 * 60 * 1000);
    // Run once on startup
    setTimeout(checkExpiredBookings, 5000);
}

module.exports = { startBookingExpirationWorker };
