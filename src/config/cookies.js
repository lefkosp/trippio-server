/**
 * Cookie options for refresh token — environment-aware (dev vs prod).
 */

const env = require('./env');

const COOKIE_NAME = 'trippio_refresh';

function getCookieOptions() {
  if (env.isProd()) {
    return {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: '.trippio.com',
      maxAge: env.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
    };
  }
  return {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    domain: undefined,
    maxAge: env.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
  };
}

module.exports = { COOKIE_NAME, getCookieOptions };
