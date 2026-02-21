require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const connectDb = require('./config/db');
const apiRoutes = require('./routes/api.routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = env.port;

// ── Middleware ──────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Rate limit auth endpoints (apply to /api/auth only via route)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  skip: () => env.isDev(),
  message: { data: null, error: { message: 'Too many requests', code: 'RATE_LIMIT' } },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Health check ────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ ok: true }));

// ── API routes ──────────────────────────────────────────────
app.use('/api/auth', authLimiter, require('./routes/auth.routes'));
app.use('/api', apiRoutes);

// ── Error handling ──────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start ───────────────────────────────────────────────────
async function start() {
  await connectDb();
  app.listen(PORT, () => {
    console.log(`🚀  Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('❌  Server failed:', err);
  process.exit(1);
});
