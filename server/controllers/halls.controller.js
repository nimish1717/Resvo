const prisma = require('../lib/prismaClient');

async function getAllHalls(req, res) {
    try {
        const halls = await prisma.halls.findMany({
            where: {
                organizations: {
                    status: 'approved',
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        res.json({ halls });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong while fetching halls'
        });
    }
}

module.exports = {
    getAllHalls,
};