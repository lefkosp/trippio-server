const asyncHandler = require('../middleware/asyncHandler');
const dayService = require('../services/day.service');

exports.getDays = asyncHandler(async (req, res) => {
  const days = await dayService.findByTrip(req.params.tripId);
  res.json({ data: days, error: null });
});

exports.getDay = asyncHandler(async (req, res) => {
  const day = await dayService.findById(req.params.dayId);
  if (!day) {
    return res.status(404).json({
      data: null,
      error: { message: 'Day not found', code: 'NOT_FOUND' },
    });
  }
  res.json({ data: day, error: null });
});

exports.createDay = asyncHandler(async (req, res) => {
  const day = await dayService.create({ ...req.body, tripId: req.params.tripId });
  res.status(201).json({ data: day, error: null });
});

exports.generateDays = asyncHandler(async (req, res) => {
  const days = await dayService.generateForTrip(req.params.tripId);
  if (!days) {
    return res.status(404).json({
      data: null,
      error: { message: 'Trip not found', code: 'NOT_FOUND' },
    });
  }
  res.status(201).json({ data: days, error: null });
});

exports.updateDay = asyncHandler(async (req, res) => {
  const { city, notes } = req.body;
  const day = await dayService.update(req.params.dayId, { city, notes });
  if (!day) {
    return res.status(404).json({
      data: null,
      error: { message: 'Day not found', code: 'NOT_FOUND' },
    });
  }
  res.json({ data: day, error: null });
});
