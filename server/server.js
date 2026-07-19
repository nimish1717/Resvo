require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');



const hallsRouter = require('./routes/halls.routes');
const bookingRouter = require('./routes/bookings.routes');
const organizationsRouter = require('./routes/organizations.routes');
const authRouter = require('./routes/auth.routes');
const { startTokenCleanupWorker } = require('./services/tokenCleanupWorker');



const app = express();

startTokenCleanupWorker();

app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const globalLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: false,
        message: 'Too many requests, please try again later'
    }
});
app.use(globalLimiter);


const prisma = require('./lib/prismaClient');

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Resvo API is running' });
});

app.get('/api/stats', async (req, res) => {
    try {
        const [halls, organizations, bookings] = await Promise.all([
            prisma.halls.count(),
            prisma.organizations.count({ where: { status: 'approved' } }),
            prisma.bookings.count({ where: { status: { in: ['approved', 'checked_in', 'completed'] } } })
        ]);
        res.json({ halls, organizations, bookings });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});


app.use('/api/halls', hallsRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/organizations", organizationsRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin", require('./routes/admin.routes'));


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Resvo API listening on http://localhost:${PORT}`);
});