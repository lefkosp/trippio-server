require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const Sentry = require('@sentry/node');

const env = require('./config/env');
const connectDb = require('./config/db');
const apiRoutes = require('./routes/api.routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

if (env.sentryDsn) {
  Sentry.init({ dsn: env.sentryDsn, environment: env.nodeEnv });
}

const app = express();
const PORT = env.port;

// Render sits in front of the app behind its own reverse proxy, so req.ip / X-Forwarded-For
// must come from that one trusted hop — otherwise express-rate-limit refuses to use it (a
// client could otherwise spoof X-Forwarded-For to dodge IP-based rate limiting).
if (env.isProd()) {
  app.set('trust proxy', 1);
}

// ── Middleware ──────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: env.clientOrigins, credentials: true }));
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
if (env.sentryDsn) {
  Sentry.setupExpressErrorHandler(app);
}
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
