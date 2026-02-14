const { Router } = require('express');
const ctrl = require('../controllers/event.controller');

const router = Router();

// Nested under /days/:dayId
router.get('/days/:dayId/events', ctrl.getEvents);
router.post('/days/:dayId/events', ctrl.createEvent);

// Direct access
router.patch('/events/:eventId', ctrl.updateEvent);
router.delete('/events/:eventId', ctrl.deleteEvent);

module.exports = router;
