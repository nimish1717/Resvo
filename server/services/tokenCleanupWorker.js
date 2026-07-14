const prisma = require('../lib/prismaClient');

const startTokenCleanupWorker = () => {
    // Run every 1 hour (3600000 ms)
    setInterval(async () => {
        try {
            const result = await prisma.$executeRaw`
                DELETE FROM refresh_tokens 
                WHERE expires_at < now() OR revoked = true;
            `;
            
            if (result > 0) {
                console.log(`[Token Cleanup] Deleted ${result} expired or revoked refresh tokens.`);
            }
        } catch (error) {
            console.error('[Token Cleanup] Error deleting old tokens:', error);
        }
    }, 60 * 60 * 1000); // 1 hour
};

module.exports = { startTokenCleanupWorker };
