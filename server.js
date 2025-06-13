require('dotenv').config();
const express = require('express');
const app = express();

const { connectToDatabase } = require('./db/db');
const bookingRoute = require('./routes/bookings');

// 🧠 Redis & Rate Limit
const rateLimit = require('express-rate-limit');
const {RedisStore} = require('rate-limit-redis');
const redisClient = require('./utils/cache'); // Make sure this exports your Redis client instance

// Apply JSON parser
app.use(express.json());

// 🔐 Rate Limiter Middleware (Global)
const limiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Adds `RateLimit-*` headers
  legacyHeaders: false,  // Disable `X-RateLimit-*` headers
  message: {
    status: 429,
    error: 'Too many requests. Please try again later.',
  },
  keyGenerator: (req, res) => {
    return (
      req.ip ||
      req.headers['x-forwarded-for'] ||
      req.connection?.remoteAddress ||
      'internal-service' // fallback key
    );
  },
});

app.use(limiter)

// Main route
app.use('/api/bookings', bookingRoute);

// Start server after DB connects
const PORT = 3001;
connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Service Marketplace API running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err);
  });
