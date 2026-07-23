const prisma = require('./prismaClient');

const logOrganizationActivity = async (organization_id, action, details = null) => {
    try {
        await prisma.organization_activity_logs.create({
            data: {
                organization_id,
                action,
                details
            }
        });
    } catch (error) {
        console.error('Failed to log organization activity:', error);
    }
};

module.exports = { logOrganizationActivity };
