const jwt = require('jsonwebtoken');
const prisma = require('../lib/prismaClient');

const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            status: false,
            message: 'Missing or malformed Authorization header'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            status: false,
            message: 'Invalid or expired token'
        });
    }
}

const verifySuperAdmin = (req, res, next) => {
    if (req.user?.role !== 'SUPER_ADMIN') {
        return res.status(403).json({
            status: false,
            message: 'Super Admin access required'
        });
    }
    next();
};

const verifyOrgAdmin = async (req, res, next) => {
    try {
        if (req.user?.role !== 'ORG_ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
            return res.status(403).json({
                status: false,
                message: 'Organization Admin access required'
            });
        }

        // Find the organization owned by this user
        const organization = await prisma.organizations.findFirst({
            where: { owner_user_id: req.user.userId }
        });

        if (!organization) {
            return res.status(404).json({
                status: false,
                message: 'No organization found for this admin'
            });
        }


        req.organization = organization;
        next();
    } catch (err) {
        console.error('Error in verifyOrgAdmin middleware:', err);
        return res.status(500).json({
            status: false,
            message: 'Internal server error verifying organization access'
        });
    }
};

const verifyApprovedOrgAdmin = async (req, res, next) => {
    // This assumes verifyOrgAdmin is called first
    if (!req.organization) {
        return res.status(403).json({
            status: false,
            message: 'Organization Admin access required'
        });
    }

    if (req.organization.status === 'pending') {
        return res.status(403).json({
            status: false,
            message: 'Your organization is pending approval by a Super Admin.'
        });
    }
    
    if (req.organization.status === 'rejected') {
        return res.status(403).json({
            status: false,
            message: 'Your organization request has been rejected.'
        });
    }

    next();
};

module.exports = { requireAuth, verifySuperAdmin, verifyOrgAdmin, verifyApprovedOrgAdmin };