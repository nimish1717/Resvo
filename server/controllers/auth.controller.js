const prisma = require('../lib/prismaClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const redis = require('../lib/redisClient');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ status: false, message: 'email is required' });
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Save to Redis with 5 min TTL
        const cacheKey = `otp:${email}`;
        await redis.set(cacheKey, otp, 'EX', 300);

        // Generate HTML Email Template
        const htmlTemplate = `
        <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #f7f9fb; padding: 40px 20px; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                <!-- Header -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom: 1px solid #eef2f6; padding: 24px 32px;">
                    <tr>
                        <td align="left" style="font-size: 24px; font-weight: 800; color: #5D3FD3; letter-spacing: -0.5px;">RESVO</td>
                        <td align="right" style="font-size: 12px; color: #666;">Secure. Simple. Seamless.</td>
                    </tr>
                </table>
                
                <!-- Hero -->
                <div style="padding: 40px 32px; text-align: center;">
                    <h1 style="margin: 0 0 16px; font-size: 32px; color: #111827;">Welcome to <span style="color: #5D3FD3;">Resvo!</span></h1>
                    <p style="margin: 0 0 32px; font-size: 16px; color: #4b5563; line-height: 1.5;">Thank you for signing up. To complete your registration, please verify your email address using the OTP below.</p>
                    
                    <!-- OTP Box -->
                    <h3 style="margin: 0 0 16px; font-size: 18px; color: #111827;">Your OTP Code</h3>
                    <div style="margin-bottom: 24px;">
                        ${otp.split('').map(digit => `<div style="width: 45px; height: 55px; border: 1px solid #e5e7eb; border-radius: 8px; display: inline-block; margin: 0 4px; text-align: center; line-height: 55px; font-size: 28px; font-weight: 700; color: #5D3FD3; background-color: #ffffff;">${digit}</div>`).join('')}
                    </div>
                    
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">This code will expire in <strong style="color: #5D3FD3;">5 minutes</strong>.</p>
                </div>
                
                <!-- Security Tip -->
                <div style="padding: 0 32px 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
                        <tr>
                            <td width="40" valign="top" style="padding-right: 16px;">
                                <div style="background-color: #ede9fe; width: 40px; height: 40px; border-radius: 50%; text-align: center; line-height: 40px; font-size: 20px;">🔒</div>
                            </td>
                            <td valign="top">
                                <h4 style="margin: 0 0 8px; font-size: 16px; color: #0f172a;">Security Tip</h4>
                                <p style="margin: 0; font-size: 14px; color: #475569; line-height: 1.5;">Do not share this OTP with anyone. Resvo will never ask for your OTP or password.</p>
                            </td>
                        </tr>
                    </table>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f8fafc; padding: 32px; text-align: center; border-top: 1px solid #eef2f6;">
                    <p style="margin: 0 0 16px; font-size: 12px; color: #94a3b8;">If you didn't create an account with <span style="color: #5D3FD3;">Resvo</span>, you can safely ignore this email.</p>
                    <p style="margin: 0; font-size: 12px; color: #94a3b8;">&copy; ${new Date().getFullYear()} Resvo. All rights reserved.<br/>Resvo Technologies Pvt. Ltd.</p>
                </div>
            </div>
        </div>
        `;

        // Send Email
        await transporter.sendMail({
            from: '"Resvo Verify" <noreply@resvo.com>',
            to: email,
            subject: 'Your Resvo Verification Code',
            text: `Your OTP is ${otp}. It will expire in 5 minutes.`, // Plain text fallback
            html: htmlTemplate // Rich HTML version
        });

        return res.status(200).json({ status: true, message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        return res.status(500).json({ status: false, message: 'Failed to send OTP' });
    }
};

const generateTokens = async (userId, email, isSuperAdmin, role) => {
    const finalRole = isSuperAdmin ? 'SUPER_ADMIN' : role;
    const token = jwt.sign(
        { userId, email, role: finalRole },
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

const userSignup = async (req, res) => {
    try {
        const { name, email, password, otp } = req.body;

        if (!name || !email || !password || !otp) {
            return res.status(400).json({
                status: false,
                message: 'name, email, password, and otp are all required'
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

        // Validate OTP
        const cacheKey = `otp:${email}`;
        const storedOtp = await redis.get(cacheKey);
        if (!storedOtp || storedOtp !== otp) {
            return res.status(400).json({ status: false, message: 'Invalid or expired OTP' });
        }
        await redis.del(cacheKey);

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.users.create({
            data: {
                name,
                email,
                password_hash: passwordHash,
                role: 'USER'
            },
        });

        const isSuperAdmin = user.email === process.env.SUPER_ADMIN_EMAIL;
        const { token, refreshToken } = await generateTokens(user.id, user.email, isSuperAdmin, user.role);

        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('refreshToken', refreshToken, { 
            httpOnly: true, 
            secure: isProd, 
            sameSite: isProd ? 'none' : 'lax', 
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        const finalRole = isSuperAdmin ? 'SUPER_ADMIN' : user.role;

        return res.status(201).json({
            status: true,
            message: 'User account created successfully',
            user: { id: user.id, name: user.name, email: user.email, role: finalRole },
            token
        });

    } catch (error) {
        console.error('Error in userSignup:', error);
        return res.status(500).json({
            status: false,
            message: 'Something went wrong while creating the account',
            error: error.message
        });
    }
}

const orgAdminSignup = async (req, res) => {
    try {
        const { name, email, password, phone, organizationName, otp } = req.body;

        if (!name || !email || !password || !phone || !organizationName || !otp) {
            return res.status(400).json({
                status: false,
                message: 'name, email, password, phone, organizationName, and otp are required'
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

        // Validate OTP
        const cacheKey = `otp:${email}`;
        const storedOtp = await redis.get(cacheKey);
        if (!storedOtp || storedOtp !== otp) {
            return res.status(400).json({ status: false, message: 'Invalid or expired OTP' });
        }
        await redis.del(cacheKey);

        const passwordHash = await bcrypt.hash(password, 10);

        // Transaction to create user and organization
        const user = await prisma.$transaction(async (tx) => {
            const newUser = await tx.users.create({
                data: {
                    name,
                    email,
                    phone,
                    password_hash: passwordHash,
                    role: 'ORG_ADMIN'
                }
            });

            await tx.organizations.create({
                data: {
                    name: organizationName,
                    owner_user_id: newUser.id,
                    status: 'pending'
                }
            });

            return newUser;
        });

        const isSuperAdmin = user.email === process.env.SUPER_ADMIN_EMAIL;
        const { token, refreshToken } = await generateTokens(user.id, user.email, isSuperAdmin, user.role);

        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('refreshToken', refreshToken, { 
            httpOnly: true, 
            secure: isProd, 
            sameSite: isProd ? 'none' : 'lax', 
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        const finalRole = isSuperAdmin ? 'SUPER_ADMIN' : user.role;

        return res.status(201).json({
            status: true,
            message: 'Organization Admin account created successfully. Awaiting Super Admin approval.',
            user: { id: user.id, name: user.name, email: user.email, role: finalRole },
            token
        });

    } catch (error) {
        console.error('Error in orgAdminSignup:', error);
        return res.status(500).json({
            status: false,
            message: 'Something went wrong while creating the organization account',
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

        if (!user || !user.password_hash) {
            return res.status(200).json({
                status: false,
                message: 'Invalid email or password'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(200).json({
                status: false,
                message: 'Invalid email or password'
            });
        }

        const isSuperAdmin = user.email === process.env.SUPER_ADMIN_EMAIL;
        const { token, refreshToken } = await generateTokens(user.id, user.email, isSuperAdmin, user.role);

        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('refreshToken', refreshToken, { 
            httpOnly: true, 
            secure: isProd, 
            sameSite: isProd ? 'none' : 'lax', 
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        const finalRole = isSuperAdmin ? 'SUPER_ADMIN' : user.role;

        return res.status(200).json({
            status: true,
            message: 'Login successful',
            user: { id: user.id, name: user.name, email: user.email, role: finalRole },
            token
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
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(200).json({ status: false, message: 'refreshToken cookie is required' });
        }

        const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        const tokens = await prisma.$queryRaw`
            SELECT id, user_id, revoked, revoked_reason, expires_at 
            FROM refresh_tokens 
            WHERE token_hash = ${tokenHash}
        `;

        if (tokens.length === 0) {
            return res.status(200).json({ status: false, message: 'Invalid refresh token' });
        }

        const dbToken = tokens[0];

        // Check expiration
        if (new Date(dbToken.expires_at) < new Date()) {
            return res.status(200).json({ status: false, message: 'Refresh token expired' });
        }

        // Theft Detection
        if (dbToken.revoked && dbToken.revoked_reason === 'rotated') {
            await prisma.$queryRaw`UPDATE refresh_tokens SET revoked = true WHERE user_id = ${dbToken.user_id}::uuid`;
            return res.status(200).json({ status: false, message: 'Token theft detected. All sessions revoked.' });
        } else if (dbToken.revoked) {
            return res.status(200).json({ status: false, message: 'Invalid or expired refresh token' });
        }

        // Token is valid: Revoke it for rotation
        await prisma.$queryRaw`UPDATE refresh_tokens SET revoked = true, revoked_reason = 'rotated' WHERE id = ${dbToken.id}::uuid`;

        // Get user details
        const users = await prisma.$queryRaw`SELECT id, name, email, role FROM users WHERE id = ${dbToken.user_id}::uuid`;
        if (users.length === 0) return res.status(404).json({ status: false, message: 'User not found' });
        const user = users[0];

        const isSuperAdmin = user.email === process.env.SUPER_ADMIN_EMAIL;

        // Generate new pair
        const newTokens = await generateTokens(user.id, user.email, isSuperAdmin, user.role);

        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('refreshToken', newTokens.refreshToken, { 
            httpOnly: true, 
            secure: isProd, 
            sameSite: isProd ? 'none' : 'lax', 
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        const finalRole = isSuperAdmin ? 'SUPER_ADMIN' : user.role;

        return res.status(200).json({
            status: true,
            message: 'Token refreshed successfully',
            token: newTokens.token,
            user: { id: user.id, name: user.name, email: user.email, role: finalRole }
        });

    } catch (error) {
        return res.status(500).json({ status: false, message: 'Error refreshing token', error: error.message });
    }
}

const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(200).json({ status: true, message: 'Already logged out' });
        }

        const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        await prisma.$queryRaw`
            UPDATE refresh_tokens 
            SET revoked = true, revoked_reason = 'logged_out'
            WHERE token_hash = ${tokenHash}
        `;

        const isProd = process.env.NODE_ENV === 'production';
        res.clearCookie('refreshToken', { 
            httpOnly: true, 
            secure: isProd, 
            sameSite: isProd ? 'none' : 'lax'
        });
        return res.status(200).json({ status: true, message: 'Logged out successfully' });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Error logging out', error: error.message });
    }
}

module.exports = {
    sendOtp,
    userSignup,
    orgAdminSignup,
    login,
    refresh,
    logout
}