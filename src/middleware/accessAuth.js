const { Trip, Day } = require('../models');
const authService = require('../services/auth.service');

function sendError(res, status, message, code) {
  return res.status(status).json({
    data: null,
    error: { message, code },
  });
}

function withAsync(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function getBearerToken(req) {
  const header = req.headers.authorization;
  if (!header) return null;
  if (!header.startsWith('Bearer ')) return '';
  return header.slice(7).trim();
}

function attachAccessContext(req, res, next) {
  req.user = null;
  req.share = null;

  const token = getBearerToken(req);
  if (token === null) return next();
  if (!token) return sendError(res, 401, 'Authorization required', 'UNAUTHORIZED');

  try {
    const payload = authService.verifyAccessToken(token);
    if (payload?.kind === 'share') {
      if (!payload.tripId || payload.role !== 'viewer') {
        return sendError(res, 401, 'Invalid or expired token', 'UNAUTHORIZED');
      }
      req.share = { tripId: String(payload.tripId), role: payload.role };
      return next();
    }
    if (!payload?.userId) {
      return sendError(res, 401, 'Invalid or expired token', 'UNAUTHORIZED');
    }
    req.user = { id: String(payload.userId), email: payload.email };
    return next();
  } catch {
    return sendError(res, 401, 'Invalid or expired token', 'UNAUTHORIZED');
  }
}

function isOwner(trip, userId) {
  return String(trip.createdBy) === String(userId);
}

function getCollaboratorRole(trip, userId) {
  const match = (trip.collaborators || []).find((c) => String(c.userId) === String(userId));
  return match?.role || null;
}

function canReadAsUser(trip, userId) {
  if (isOwner(trip, userId)) return true;
  const role = getCollaboratorRole(trip, userId);
  return role === 'editor' || role === 'viewer';
}

function canWriteAsUser(trip, userId) {
  if (isOwner(trip, userId)) return true;
  return getCollaboratorRole(trip, userId) === 'editor';
}

async function loadTrip(tripId) {
  const trip = await Trip.findById(tripId);
  if (!trip) return null;
  return trip;
}

async function canUserReadTrip(tripId, userId) {
  const trip = await loadTrip(tripId);
  if (!trip) return { ok: false, status: 404 };
  if (!canReadAsUser(trip, userId)) return { ok: false, status: 403, trip };
  return { ok: true, trip };
}

async function canUserWriteTrip(tripId, userId) {
  const trip = await loadTrip(tripId);
  if (!trip) return { ok: false, status: 404 };
  if (!canWriteAsUser(trip, userId)) return { ok: false, status: 403, trip };
  return { ok: true, trip };
}

function optionalAuth(req, res, next) {
  const token = getBearerToken(req);
  req.user = null;
  req.share = null;
  if (token === null) return next();
  if (!token) return sendError(res, 401, 'Invalid or expired token', 'UNAUTHORIZED');

  try {
    const payload = authService.verifyAccessToken(token);
    if (payload?.userId) {
      req.user = { id: String(payload.userId), email: payload.email };
    }
    return next();
  } catch {
    return sendError(res, 401, 'Invalid or expired token', 'UNAUTHORIZED');
  }
}

function requireUserAuth(req, res, next) {
  if (!req.user) {
    return sendError(res, 401, 'Authorization required', 'UNAUTHORIZED');
  }
  return next();
}

function requireTripReadAccess(tripIdParamName = 'tripId') {
  return withAsync(async function tripReadAccess(req, res, next) {
    const requestedTripId = req.params[tripIdParamName];
    const trip = await loadTrip(requestedTripId);
    if (!trip) {
      return sendError(res, 404, 'Trip not found', 'NOT_FOUND');
    }
    req.trip = trip;

    if (req.user) {
      if (!canReadAsUser(trip, req.user.id)) {
        return sendError(res, 403, 'Forbidden', 'FORBIDDEN');
      }
      return next();
    }

    if (req.share) {
      if (req.share.role !== 'viewer' || String(req.share.tripId) !== String(requestedTripId)) {
        return sendError(res, 403, 'Forbidden', 'FORBIDDEN');
      }
      return next();
    }

    return sendError(res, 401, 'Authorization required', 'UNAUTHORIZED');
  });
}

function requireTripWriteAccess(tripIdParamName = 'tripId') {
  return withAsync(async function tripWriteAccess(req, res, next) {
    const requestedTripId = req.params[tripIdParamName];
    if (req.share) {
      return sendError(res, 403, 'Forbidden', 'FORBIDDEN');
    }
    if (!req.user) {
      return sendError(res, 401, 'Authorization required', 'UNAUTHORIZED');
    }

    const check = await canUserWriteTrip(requestedTripId, req.user.id);
    if (!check.ok) {
      const message = check.status === 404 ? 'Trip not found' : 'Forbidden';
      return sendError(res, check.status, message, check.status === 404 ? 'NOT_FOUND' : 'FORBIDDEN');
    }
    req.trip = check.trip;
    return next();
  });
}

function requireTripOwner(tripIdParamName = 'tripId') {
  return withAsync(async function tripOwnerOnly(req, res, next) {
    if (!req.user) {
      return sendError(res, 401, 'Authorization required', 'UNAUTHORIZED');
    }
    const requestedTripId = req.params[tripIdParamName];
    const trip = await loadTrip(requestedTripId);
    if (!trip) {
      return sendError(res, 404, 'Trip not found', 'NOT_FOUND');
    }
    if (!isOwner(trip, req.user.id)) {
      return sendError(res, 403, 'Forbidden', 'FORBIDDEN');
    }
    req.trip = trip;
    return next();
  });
}

function requireDayReadAccess(dayIdParamName = 'dayId') {
  return withAsync(async function dayReadAccess(req, res, next) {
    const day = await Day.findById(req.params[dayIdParamName]);
    if (!day) {
      return sendError(res, 404, 'Day not found', 'NOT_FOUND');
    }
    req.day = day;
    const tripId = String(day.tripId);

    if (req.user) {
      const check = await canUserReadTrip(tripId, req.user.id);
      if (!check.ok) {
        const message = check.status === 404 ? 'Trip not found' : 'Forbidden';
        return sendError(res, check.status, message, check.status === 404 ? 'NOT_FOUND' : 'FORBIDDEN');
      }
      req.trip = check.trip;
      return next();
    }

    if (req.share) {
      if (req.share.role !== 'viewer' || String(req.share.tripId) !== tripId) {
        return sendError(res, 403, 'Forbidden', 'FORBIDDEN');
      }
      return next();
    }

    return sendError(res, 401, 'Authorization required', 'UNAUTHORIZED');
  });
}

function requireDayWriteAccess(dayIdParamName = 'dayId') {
  return withAsync(async function dayWriteAccess(req, res, next) {
    const day = await Day.findById(req.params[dayIdParamName]);
    if (!day) {
      return sendError(res, 404, 'Day not found', 'NOT_FOUND');
    }
    req.day = day;

    if (req.share) {
      return sendError(res, 403, 'Forbidden', 'FORBIDDEN');
    }
    if (!req.user) {
      return sendError(res, 401, 'Authorization required', 'UNAUTHORIZED');
    }

    const check = await canUserWriteTrip(day.tripId, req.user.id);
    if (!check.ok) {
      const message = check.status === 404 ? 'Trip not found' : 'Forbidden';
      return sendError(res, check.status, message, check.status === 404 ? 'NOT_FOUND' : 'FORBIDDEN');
    }
    req.trip = check.trip;
    return next();
  });
}

function requireResourceWriteAccess(model, resourceIdParamName, options = {}) {
  const tripIdField = options.tripIdField || 'tripId';
  const notFoundMessage = options.notFoundMessage || 'Resource not found';

  return withAsync(async function resourceWriteAccess(req, res, next) {
    if (req.share) {
      return sendError(res, 403, 'Forbidden', 'FORBIDDEN');
    }
    if (!req.user) {
      return sendError(res, 401, 'Authorization required', 'UNAUTHORIZED');
    }

    const resource = await model.findById(req.params[resourceIdParamName]);
    if (!resource) {
      return sendError(res, 404, notFoundMessage, 'NOT_FOUND');
    }
    req.resource = resource;

    const check = await canUserWriteTrip(resource[tripIdField], req.user.id);
    if (!check.ok) {
      const message = check.status === 404 ? 'Trip not found' : 'Forbidden';
      return sendError(res, check.status, message, check.status === 404 ? 'NOT_FOUND' : 'FORBIDDEN');
    }
    req.trip = check.trip;
    return next();
  });
}

module.exports = {
  attachAccessContext,
  optionalAuth,
  requireUserAuth,
  requireTripReadAccess,
  requireTripWriteAccess,
  requireTripOwner,
  requireDayReadAccess,
  requireDayWriteAccess,
  requireResourceWriteAccess,
};
