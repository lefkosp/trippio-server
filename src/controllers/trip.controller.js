const asyncHandler = require('../middleware/asyncHandler');
const tripService = require('../services/trip.service');

exports.getTrips = asyncHandler(async (req, res) => {
  const trips = await tripService.findAll();
  res.json({ data: trips, error: null });
});

exports.getTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.findById(req.params.tripId);
  if (!trip) {
    return res.status(404).json({
      data: null,
      error: { message: 'Trip not found', code: 'NOT_FOUND' },
    });
  }
  res.json({ data: trip, error: null });
});

exports.createTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.create(req.body);
  res.status(201).json({ data: trip, error: null });
});
