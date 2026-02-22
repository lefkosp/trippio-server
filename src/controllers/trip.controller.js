const asyncHandler = require('../middleware/asyncHandler');
const tripService = require('../services/trip.service');
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

exports.createTrip = [requireAuth, asyncHandler(async (req, res) => {
  const trip = await tripService.create(req.body, req.user.id);
  res.status(201).json({ data: trip, error: null });
})];

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
