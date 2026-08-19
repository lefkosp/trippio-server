const asyncHandler = require('../middleware/asyncHandler');
const placeService = require('../services/place.service');
const geocodeService = require('../services/geocode.service');

exports.getPlaces = asyncHandler(async (req, res) => {
  const places = await placeService.findByTrip(req.params.tripId, req.query.query);
  res.json({ data: places, error: null });
});

exports.createPlace = asyncHandler(async (req, res) => {
  const place = await placeService.create({ ...req.body, tripId: req.params.tripId });
  res.status(201).json({ data: place, error: null });

  // Fire-and-forget: don't hold the response open for a geocode lookup. If
  // coordinates were already supplied (e.g. from a promoted proposal), leave
  // them alone rather than overwriting a manually-picked location.
  if (place.address && (place.lat == null || place.lng == null)) {
    geocodeService.geocode(place.address).then((coords) => {
      if (coords) placeService.update(place._id, coords).catch(() => {});
    });
  }
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
