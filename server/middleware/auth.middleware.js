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

const requireRole = (role, resolveOrganizationId) => {
    return async (req, res, next) => {
        try {
            if (role === 'super_admin') {
                if (!req.user?.isSuperAdmin) {
                    return res.status(403).json({
                        status: false,
                        message: 'Super Admin access required'
                    });
                }
                return next();
            }

            if (role === 'org_admin' || role === 'org_owner') {
                const organizationId = await resolveOrganizationId(req);

                if (!organizationId) {
                    return res.status(404).json({
                        status: false,
                        message: 'Could not determine the organization for this request'
                    });
                }

                const membership = await prisma.organization_members.findUnique({
                    where: {
                        organization_id_user_id: {
                            organization_id: organizationId,
                            user_id: req.user.userId,
                        },
                    },
                });

                if (!membership) {
                    return res.status(403).json({
                        status: false,
                        message: 'You do not have admin access to this organization'
                    });
                }

                if (role === 'org_owner' && membership.role !== 'org_admin') {
                    return res.status(403).json({
                        status: false,
                        message: 'Only the Organization Admin can manage membership'
                    });
                }

                req.organizationId = organizationId;
                return next();
            }

            return res.status(500).json({
                status: false,
                message: `Unknown role passed to requireRole: "${role}"`
            });
        } catch (err) {
            console.error('Error checking role:', err);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong while checking permissions'
            });
        }
    };
}

module.exports = { requireAuth, requireRole };