const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { COOKIE_NAME, getCookieOptions } = require('../config/cookies');
const { User, LoginToken, Session } = require('../models');

const LOGIN_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 min

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function randomToken() {
  return crypto.randomBytes(32).toString('hex');
}

function signAccessToken(payload, options = {}) {
  if (!env.accessTokenSecret) {
    throw new Error('ACCESS_TOKEN_SECRET is not set');
  }
  const expiresIn = options.expiresIn || `${env.accessTokenTtlMinutes}m`;
  return jwt.sign(
    payload,
    env.accessTokenSecret,
    { expiresIn }
  );
}

function verifyAccessToken(token) {
  if (!env.accessTokenSecret) {
    throw new Error('ACCESS_TOKEN_SECRET is not set');
  }
  return jwt.verify(token, env.accessTokenSecret);
}

async function findOrCreateUser(email) {
  const normalized = String(email).toLowerCase().trim();
  let user = await User.findOne({ email: normalized });
  if (!user) {
    user = await User.create({ email: normalized });
  }
  return user;
}

async function createLoginToken(userId) {
  const raw = randomToken();
  const hash = hashToken(raw);
  const expiresAt = new Date(Date.now() + LOGIN_TOKEN_TTL_MS);
  await LoginToken.create({ userId, tokenHash: hash, expiresAt });
  return { raw, expiresAt };
}

async function consumeLoginToken(rawToken) {
  const hash = hashToken(rawToken);
  const doc = await LoginToken.findOne({ tokenHash: hash });
  if (!doc) return null;
  if (doc.usedAt) return null;
  if (new Date() > doc.expiresAt) return null;
  doc.usedAt = new Date();
  await doc.save();
  return doc;
}

async function createSession(userId) {
  const raw = randomToken();
  const hash = hashToken(raw);
  const expiresAt = new Date(Date.now() + env.refreshTokenTtlDays * 24 * 60 * 60 * 1000);
  await Session.create({ userId, tokenHash: hash, expiresAt });
  return { raw, expiresAt };
}

async function findValidSession(refreshTokenRaw) {
  if (!refreshTokenRaw) return null;
  const hash = hashToken(refreshTokenRaw);
  const session = await Session.findOne({
    tokenHash: hash,
    $or: [{ revokedAt: { $exists: false } }, { revokedAt: null }],
    expiresAt: { $gt: new Date() },
  });
  return session;
}

async function revokeSession(refreshTokenRaw) {
  if (!refreshTokenRaw) return;
  const hash = hashToken(refreshTokenRaw);
  await Session.updateOne(
    { tokenHash: hash },
    { $set: { revokedAt: new Date() } }
  );
}

module.exports = {
  COOKIE_NAME,
  getCookieOptions,
  hashToken,
  randomToken,
  signAccessToken,
  verifyAccessToken,
  findOrCreateUser,
  createLoginToken,
  consumeLoginToken,
  createSession,
  findValidSession,
  revokeSession,
};
