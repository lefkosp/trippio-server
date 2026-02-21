/**
 * Environment config — read env vars safely with defaults where appropriate.
 */

const required = (name) => {
  const v = process.env[name];
  if (v === undefined || v === '') {
    throw new Error(`Missing required env: ${name}`);
  }
  return v;
};

const optional = (name, defaultValue) => {
  const v = process.env[name];
  return v !== undefined && v !== '' ? v : defaultValue;
};

const optionalNumber = (name, defaultValue) => {
  const v = process.env[name];
  if (v === undefined || v === '') return defaultValue;
  const n = Number(v);
  return Number.isFinite(n) ? n : defaultValue;
};

const isProd = () => process.env.NODE_ENV === 'production';

// In development, allow running without ACCESS_TOKEN_SECRET (use a dev-only default)
const rawSecret = optional('ACCESS_TOKEN_SECRET', '');
const accessTokenSecret =
  rawSecret !== ''
    ? rawSecret
    : isProd()
      ? ''
      : 'dev-secret-do-not-use-in-production-trippio';

if (rawSecret === '' && !isProd()) {
  console.warn('⚠️  ACCESS_TOKEN_SECRET not set — using dev default. Set it in .env for production.');
}

module.exports = {
  port: optionalNumber('PORT', 4000),
  mongoUri: process.env.MONGO_URI || process.env.MONGO_URL,
  clientOrigin: optional('CLIENT_ORIGIN', 'http://localhost:5173'),
  appOrigin: optional('APP_ORIGIN', 'http://localhost:5173'),
  accessTokenSecret,
  accessTokenTtlMinutes: optionalNumber('ACCESS_TOKEN_TTL_MINUTES', 15),
  refreshTokenTtlDays: optionalNumber('REFRESH_TOKEN_TTL_DAYS', 30),
  nodeEnv: optional('NODE_ENV', 'development'),
  isProd,
  isDev: () => !isProd(),
};
