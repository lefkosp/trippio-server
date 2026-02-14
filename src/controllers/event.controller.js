const asyncHandler = require('../middleware/asyncHandler');
const eventService = require('../services/event.service');
const dayService = require('../services/day.service');

exports.getEvents = asyncHandler(async (req, res) => {
  const events = await eventService.findByDay(req.params.dayId);
  res.json({ data: events, error: null });
});

exports.createEvent = asyncHandler(async (req, res) => {
  const day = await dayService.findById(req.params.dayId);
  if (!day) {
    return res.status(404).json({
      data: null,
      error: { message: 'Day not found', code: 'NOT_FOUND' },
    });
  }
  const event = await eventService.create({
    ...req.body,
    dayId: day._id,
    tripId: day.tripId,
  });
  res.status(201).json({ data: event, error: null });
});

exports.updateEvent = asyncHandler(async (req, res) => {
  const event = await eventService.update(req.params.eventId, req.body);
  if (!event) {
    return res.status(404).json({
      data: null,
      error: { message: 'Event not found', code: 'NOT_FOUND' },
    });
  }
  res.json({ data: event, error: null });
});

exports.deleteEvent = asyncHandler(async (req, res) => {
  const event = await eventService.remove(req.params.eventId);
  if (!event) {
    return res.status(404).json({
      data: null,
      error: { message: 'Event not found', code: 'NOT_FOUND' },
    });
  }
  res.json({ data: event, error: null });
});
