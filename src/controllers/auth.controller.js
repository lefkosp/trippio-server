const asyncHandler = require('../middleware/asyncHandler');
const env = require('../config/env');
const authService = require('../services/auth.service');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function envelopeSuccess(data) {
  return { data, error: null };
}

function envelopeError(message, code = 'BAD_REQUEST', details = undefined) {
  return { data: null, error: { message, code, details } };
}

exports.requestLink = asyncHandler(async (req, res) => {
  const { email } = req.body || {};
  if (!email || typeof email !== 'string') {
    return res.status(400).json(envelopeError('Email is required', 'VALIDATION_ERROR'));
  }
  const trimmed = email.trim().toLowerCase();
  if (!emailRegex.test(trimmed)) {
    return res.status(400).json(envelopeError('Invalid email format', 'VALIDATION_ERROR'));
  }

  const user = await authService.findOrCreateUser(trimmed);
  const { raw, expiresAt } = await authService.createLoginToken(user._id);
  const appOrigin = env.appOrigin.replace(/\/$/, '');
  const magicLink = `${appOrigin}/auth/verify?token=${raw}`;

  if (env.isDev()) {
    console.log('[DEV] Magic link (do not log in prod):', magicLink);
    return res.json(envelopeSuccess({ ok: true, magicLink }));
  }
  res.json(envelopeSuccess({ ok: true }));
});

exports.verify = asyncHandler(async (req, res) => {
  const raw = req.query.token;
  if (!raw) {
    return res.status(400).json(envelopeError('Token is required', 'VALIDATION_ERROR'));
  }

  const loginDoc = await authService.consumeLoginToken(raw);
  if (!loginDoc) {
    return res.status(400).json(envelopeError('Invalid or expired link', 'INVALID_TOKEN'));
  }

  const user = await require('../models').User.findById(loginDoc.userId);
  if (!user) {
    return res.status(401).json(envelopeError('User not found', 'NOT_FOUND'));
  }

  user.lastLoginAt = new Date();
  await user.save();

  const { raw: refreshRaw, expiresAt } = await authService.createSession(user._id);
  const cookieOptions = { ...authService.getCookieOptions(), expires: expiresAt };
  res.cookie(authService.COOKIE_NAME, refreshRaw, cookieOptions);

  const accessToken = authService.signAccessToken({
    userId: user._id.toString(),
    email: user.email,
  });

  res.json(
    envelopeSuccess({
      accessToken,
      user: { id: user._id.toString(), email: user.email },
    })
  );
});

exports.refresh = asyncHandler(async (req, res) => {
  const refreshRaw = req.cookies?.[authService.COOKIE_NAME];
  const session = await authService.findValidSession(refreshRaw);
  if (!session) {
    return res.status(401).json(envelopeError('Invalid or expired session', 'UNAUTHORIZED'));
  }

  const user = await require('../models').User.findById(session.userId);
  if (!user) {
    return res.status(401).json(envelopeError('User not found', 'NOT_FOUND'));
  }

  const accessToken = authService.signAccessToken({
    userId: user._id.toString(),
    email: user.email,
  });

  res.json(
    envelopeSuccess({
      accessToken,
      user: { id: user._id.toString(), email: user.email },
    })
  );
});

exports.logout = asyncHandler(async (req, res) => {
  const refreshRaw = req.cookies?.[authService.COOKIE_NAME];
  await authService.revokeSession(refreshRaw);
  const opts = authService.getCookieOptions();
  res.clearCookie(authService.COOKIE_NAME, {
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
    domain: opts.domain,
    path: '/',
  });
  res.json(envelopeSuccess({ ok: true }));
});
