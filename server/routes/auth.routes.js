const express = require("express");
const rateLimit = require("express-rate-limit");
const { signup, login, refresh, logout } = require("../controllers/auth.controller");

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: false,
        message: 'Too many authentication attempts, please try again after 15 minutes'
    }
});

const refreshLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: false,
        message: 'Too many refresh attempts'
    }
});

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/refresh', refreshLimiter, refresh);
router.post('/logout', refreshLimiter, logout);

module.exports = router;