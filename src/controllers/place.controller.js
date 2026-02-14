const asyncHandler = require('../middleware/asyncHandler');
const placeService = require('../services/place.service');

exports.getPlaces = asyncHandler(async (req, res) => {
  const places = await placeService.findByTrip(req.params.tripId, req.query.query);
  res.json({ data: places, error: null });
});

exports.createPlace = asyncHandler(async (req, res) => {
  const place = await placeService.create({ ...req.body, tripId: req.params.tripId });
  res.status(201).json({ data: place, error: null });
});

exports.updatePlace = asyncHandler(async (req, res) => {
  const place = await placeService.update(req.params.placeId, req.body);
  if (!place) {
    return res.status(404).json({
      data: null,
      error: { message: 'Place not found', code: 'NOT_FOUND' },
    });
  }
  res.json({ data: place, error: null });
});
