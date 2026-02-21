const asyncHandler = require('../middleware/asyncHandler');
const env = require('../config/env');
const authService = require('../services/auth.service');
const { TripShareLink, Trip } = require('../models');

function envelopeError(message, code) {
  return { data: null, error: { message, code } };
}

function computeExpiry(expiresInDays) {
  if (expiresInDays === undefined) return null;
  const days = Number(expiresInDays);
  if (!Number.isFinite(days) || days <= 0) return undefined;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

async function createUniqueShareLinkDoc(tripId, role, expiresAt) {
  for (let i = 0; i < 3; i += 1) {
    const rawToken = authService.randomToken();
    const tokenHash = authService.hashToken(rawToken);
    try {
      await TripShareLink.create({
        tripId,
        tokenHash,
        role,
        expiresAt: expiresAt || undefined,
      });
      return rawToken;
    } catch (err) {
      if (err?.code === 11000) continue;
      throw err;
    }
  }
  throw new Error('Failed to generate unique share token');
}

exports.createShareLink = [
  asyncHandler(async (req, res) => {
    const { role = 'viewer', expiresInDays } = req.body || {};
    if (!['viewer', 'editor'].includes(role)) {
      return res
        .status(400)
        .json(envelopeError('role must be "viewer" or "editor"', 'VALIDATION_ERROR'));
    }
    const expiresAt = computeExpiry(expiresInDays);
    if (expiresInDays !== undefined && expiresAt === undefined) {
      return res
        .status(400)
        .json(envelopeError('expiresInDays must be a positive number', 'VALIDATION_ERROR'));
    }

    const rawToken = await createUniqueShareLinkDoc(req.trip._id, role, expiresAt);
    const appOrigin = env.appOrigin.replace(/\/$/, '');
    const url = `${appOrigin}/share/${rawToken}`;

    return res.status(201).json({ data: { url }, error: null });
  }),
];

exports.resolveShareLink = [
  asyncHandler(async (req, res) => {
    const token = req.params.token;
    if (!token) {
      return res.status(404).json(envelopeError('Share link not found', 'NOT_FOUND'));
    }

    const tokenHash = authService.hashToken(token);
    const now = new Date();
    const shareLink = await TripShareLink.findOne({
      tokenHash,
      $and: [
        { $or: [{ revokedAt: { $exists: false } }, { revokedAt: null }] },
        { $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: now } }] },
      ],
    });

    if (!shareLink) {
      return res.status(404).json(envelopeError('Share link not found', 'NOT_FOUND'));
    }

    const tripId = String(shareLink.tripId);
    if (shareLink.role === 'viewer') {
      const shareAccessToken = authService.signAccessToken(
        { tripId, role: 'viewer', kind: 'share' },
        { expiresIn: '60m' }
      );
      return res.json({
        data: { shareAccessToken, tripId, role: 'viewer' },
        error: null,
      });
    }

    if (!req.user) {
      return res.json({
        data: { claimed: false, requiresAuth: true, tripId, role: 'editor' },
        error: null,
      });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json(envelopeError('Trip not found', 'NOT_FOUND'));
    }
    if (String(trip.createdBy) !== String(req.user.id)) {
      const existing = (trip.collaborators || []).find((c) => String(c.userId) === String(req.user.id));
      if (!existing) {
        trip.collaborators.push({
          userId: req.user.id,
          role: 'editor',
          addedAt: new Date(),
        });
      } else if (existing.role !== 'editor') {
        existing.role = 'editor';
      }
      await trip.save();
    }

    return res.json({
      data: { claimed: true, tripId, role: 'editor' },
      error: null,
    });
  }),
];
