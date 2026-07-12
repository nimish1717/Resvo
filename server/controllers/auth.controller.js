const prisma = require('../lib/prismaClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

        const token = jwt.sign(
            { userId: user.id, email: user.email, isSuperAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(201).json({
            status: true,
            message: 'Account created successfully',
            user: { id: user.id, name: user.name, email: user.email, isSuperAdmin },
            token,
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

        const token = jwt.sign(
            { userId: user.id, email: user.email, isSuperAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            status: true,
            message: 'Login successful',
            user: { id: user.id, name: user.name, email: user.email, isSuperAdmin },
            token,
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

module.exports = {
    signup,
    login
}