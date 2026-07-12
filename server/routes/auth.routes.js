const express = require("express");
const rateLimit = require("express-rate-limit");
const { signup, login } = require("../controllers/auth.controller");

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

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);

module.exports = router;