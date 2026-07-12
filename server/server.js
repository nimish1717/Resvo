require('dotenv').config();
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




const app = express();

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


app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Resvo API is running' });
});


app.use('/halls', hallsRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/organizations", organizationsRouter);
app.use("/api/auth", authRouter);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Resvo API listening on http://localhost:${PORT}`);
});