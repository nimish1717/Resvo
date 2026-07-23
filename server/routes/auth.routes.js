const express = require("express");
const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis").default;
const redis = require("../lib/redisClient");
const { userSignup, orgAdminSignup, login, refresh, logout } = require("../controllers/auth.controller");

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: process.env.NODE_ENV === 'production' ? 5 : 100,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand: (...args) => redis.call(...args),
    }),
    message: {
        status: false,
        message: 'Too many authentication attempts, please try again after 15 minutes'
    }
});

const refreshLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: process.env.NODE_ENV === 'production' ? 20 : 500,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand: (...args) => redis.call(...args),
    }),
    message: {
        status: false,
        message: 'Too many refresh attempts'
    }
});

router.post('/signup', authLimiter, userSignup);
router.post('/org-signup', authLimiter, orgAdminSignup);
router.post('/login', authLimiter, login);
router.post('/refresh', refreshLimiter, refresh);
router.post('/logout', refreshLimiter, logout);

module.exports = router;