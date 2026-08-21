const asyncHandler = require('../middleware/asyncHandler');
const tripService = require('../services/trip.service');
const tripPortabilityService = require('../services/tripPortability.service');
const requireAuth = require('../middleware/requireAuth');

exports.getTrips = [requireAuth, asyncHandler(async (req, res) => {
  const trips = await tripService.findAll(req.user.id);
  res.json({ data: trips, error: null });
})];

exports.getTrip = [asyncHandler(async (req, res) => {
  const trip = await tripService.findById(req.params.tripId);
  if (!trip) {
    return res.status(404).json({
      data: null,
      error: { message: 'Trip not found', code: 'NOT_FOUND' },
    });
  }
  res.json({ data: trip, error: null });
})];

function validateCreateTripBody(body) {
  const errors = [];
  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    errors.push('name is required');
  }
  if (!body.startDate) errors.push('startDate is required');
  if (!body.endDate) errors.push('endDate is required');
  const prefs = body.preferences;
  if (!prefs || typeof prefs !== 'object') {
    errors.push('preferences is required');
  } else {
    if (!prefs.destinationCity || typeof prefs.destinationCity !== 'string' || !prefs.destinationCity.trim()) {
      errors.push('preferences.destinationCity is required');
    }
    if (!prefs.pace || !['relaxed', 'balanced', 'packed'].includes(prefs.pace)) {
      errors.push('preferences.pace is required (relaxed, balanced, or packed)');
    }
    if (!Array.isArray(prefs.interests)) {
      errors.push('preferences.interests must be an array');
    } else if (prefs.interests.length < 1) {
      errors.push('preferences.interests must have at least one item');
    }
    if (!prefs.budgetLevel || !['low', 'mid', 'high'].includes(prefs.budgetLevel)) {
      errors.push('preferences.budgetLevel is required (low, mid, or high)');
    }
    const gs = prefs.groupSize;
    if (gs === undefined || gs === null || typeof gs !== 'number' || gs < 1) {
      errors.push('preferences.groupSize is required and must be at least 1');
    }
  }
  return errors;
}

exports.createTrip = [requireAuth, asyncHandler(async (req, res) => {
  const validationErrors = validateCreateTripBody(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json({
      data: null,
      error: { message: validationErrors.join('; '), code: 'VALIDATION_ERROR' },
    });
  }
  const { name, startDate, endDate, timezone, preferences } = req.body;
  const payload = {
    name: name.trim(),
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    timezone: timezone || undefined,
    preferences: {
      destinationCity: preferences.destinationCity.trim(),
      destinationCountry: preferences.destinationCountry?.trim() || undefined,
      pace: preferences.pace,
      dailyStructure: preferences.dailyStructure || undefined,
      interests: Array.isArray(preferences.interests) ? preferences.interests : [],
      budgetLevel: preferences.budgetLevel,
      transportPreference: preferences.transportPreference || undefined,
      notes: preferences.notes?.trim() || undefined,
      groupSize: Number(preferences.groupSize),
    },
  };
  const trip = await tripService.create(payload, req.user.id);
  res.status(201).json({ data: trip, error: null });
})];

exports.exportTrip = [
  asyncHandler(async (req, res) => {
    const data = await tripPortabilityService.exportTrip(req.trip._id);
    res.json({ data, error: null });
  }),
];

exports.importTrip = [
  requireAuth,
  asyncHandler(async (req, res) => {
    try {
      const trip = await tripPortabilityService.importTrip(req.user.id, req.body);
      res.status(201).json({ data: trip, error: null });
    } catch (err) {
      if (err.code === 'VALIDATION_ERROR') {
        return res.status(400).json({
          data: null,
          error: { message: err.message, code: 'VALIDATION_ERROR' },
        });
      }
      throw err;
    }
  }),
];

exports.deleteTrip = [
  requireAuth,
  asyncHandler(async (req, res) => {
    const tripId = req.params.tripId;
    const result = await tripService.deleteTripAndRelated(tripId);
    if (!result) {
      return res.status(404).json({
        data: null,
        error: { message: 'Trip not found', code: 'NOT_FOUND' },
      });
    }
    res.json({ data: { ok: true }, error: null });
  }),
];
