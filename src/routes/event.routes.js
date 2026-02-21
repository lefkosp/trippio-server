const { Router } = require('express');
const ctrl = require('../controllers/event.controller');
const { Event } = require('../models');
const {
  attachAccessContext,
  requireDayReadAccess,
  requireDayWriteAccess,
  requireResourceWriteAccess,
} = require('../middleware/accessAuth');

const router = Router();

// Nested under /days/:dayId
router.get('/days/:dayId/events', attachAccessContext, requireDayReadAccess('dayId'), ctrl.getEvents);
router.post('/days/:dayId/events', attachAccessContext, requireDayWriteAccess('dayId'), ctrl.createEvent);

// Direct access
router.patch(
  '/events/:eventId',
  attachAccessContext,
  requireResourceWriteAccess(Event, 'eventId', { notFoundMessage: 'Event not found' }),
  ctrl.updateEvent
);
router.delete(
  '/events/:eventId',
  attachAccessContext,
  requireResourceWriteAccess(Event, 'eventId', { notFoundMessage: 'Event not found' }),
  ctrl.deleteEvent
);

module.exports = router;
