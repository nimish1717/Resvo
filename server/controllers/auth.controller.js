const prisma = require('../lib/prismaClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateTokens = async (userId, email, isSuperAdmin) => {
    const token = jwt.sign(
        { userId, email, isSuperAdmin },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    await prisma.$queryRaw`
        INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
        VALUES (${userId}::uuid, ${tokenHash}, now() + interval '7 days')
    `;
    return { token, refreshToken };
}

const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                status: false,
                message: 'name, email, password are required'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                status: false,
                message: 'Password must be at least 8 characters'
            });
        }

        const existing = await prisma.users.findUnique({ where: { email } });
        if (existing) {
            return res.status(409).json({
                status: false,
                message: 'An account with this email already exists'
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.users.create({
            data: {
                name,
                email,
                password_hash: passwordHash,
            },
        });

        const isSuperAdmin = user.email === process.env.SUPER_ADMIN_EMAIL;

        const { token, refreshToken } = await generateTokens(user.id, user.email, isSuperAdmin);

        return res.status(201).json({
            status: true,
            message: 'Account created successfully',
            user: { id: user.id, name: user.name, email: user.email, isSuperAdmin },
            token,
            refreshToken
        });

    } catch (error) {
        console.error('Error in signup:', error);
        return res.status(500).json({
            status: false,
            message: 'Something went wrong while creating the account',
            error: error.message
        });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: false,
                message: 'email and password are both required'
            });
        }

        const user = await prisma.users.findUnique({ where: { email } });

        if (!user) {
            return res.status(401).json({
                status: false,
                message: 'Invalid email or password'
            });
        }

        if (!user.password_hash) {
            return res.status(401).json({
                status: false,
                message: 'Invalid email or password'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                status: false,
                message: 'Invalid email or password'
            });
        }

        const isSuperAdmin = user.email === process.env.SUPER_ADMIN_EMAIL;

        const { token, refreshToken } = await generateTokens(user.id, user.email, isSuperAdmin);

        return res.status(200).json({
            status: true,
            message: 'Login successful',
            user: { id: user.id, name: user.name, email: user.email, isSuperAdmin },
            token,
            refreshToken
        });

    } catch (error) {
        console.error('Error in login:', error);
        return res.status(500).json({
            status: false,
            message: 'Something went wrong while logging in',
            error: error.message
        });
    }
}


const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ status: false, message: 'refreshToken is required' });
        }

        const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        const tokens = await prisma.$queryRaw`
            SELECT id, user_id, revoked, expires_at 
            FROM refresh_tokens 
            WHERE token_hash = ${tokenHash}
        `;

        if (tokens.length === 0) {
            return res.status(401).json({ status: false, message: 'Invalid refresh token' });
        }

        const dbToken = tokens[0];

        // Check expiration
        if (new Date(dbToken.expires_at) < new Date()) {
            return res.status(401).json({ status: false, message: 'Refresh token expired' });
        }

        // Theft Detection
        if (dbToken.revoked) {
            await prisma.$queryRaw`UPDATE refresh_tokens SET revoked = true WHERE user_id = ${dbToken.user_id}::uuid`;
            return res.status(401).json({ status: false, message: 'Token theft detected. All sessions revoked.' });
        }

        // Token is valid: Revoke it for rotation
        await prisma.$queryRaw`UPDATE refresh_tokens SET revoked = true WHERE id = ${dbToken.id}::uuid`;

        // Get user details
        const users = await prisma.$queryRaw`SELECT id, email FROM users WHERE id = ${dbToken.user_id}::uuid`;
        if (users.length === 0) return res.status(404).json({ status: false, message: 'User not found' });
        const user = users[0];

        const isSuperAdmin = user.email === process.env.SUPER_ADMIN_EMAIL;

        // Generate new pair
        const newTokens = await generateTokens(user.id, user.email, isSuperAdmin);

        return res.status(200).json({
            status: true,
            message: 'Token refreshed successfully',
            token: newTokens.token,
            refreshToken: newTokens.refreshToken
        });

    } catch (error) {
        return res.status(500).json({ status: false, message: 'Error refreshing token', error: error.message });
    }
}

const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ status: false, message: 'refreshToken is required' });
        }

        const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        await prisma.$queryRaw`
            UPDATE refresh_tokens 
            SET revoked = true 
            WHERE token_hash = ${tokenHash}
        `;

        return res.status(200).json({ status: true, message: 'Logged out successfully' });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Error logging out', error: error.message });
    }
}

module.exports = {
    signup,
    login,
    refresh,
    logout
}