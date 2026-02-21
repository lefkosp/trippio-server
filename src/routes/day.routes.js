const { Router } = require('express');
const ctrl = require('../controllers/day.controller');
const {
  attachAccessContext,
  requireTripReadAccess,
  requireTripWriteAccess,
  requireDayReadAccess,
} = require('../middleware/accessAuth');

const router = Router();

// Nested under /trips/:tripId
router.get('/trips/:tripId/days', attachAccessContext, requireTripReadAccess('tripId'), ctrl.getDays);
router.post('/trips/:tripId/days', attachAccessContext, requireTripWriteAccess('tripId'), ctrl.createDay);

// Direct access
router.get('/days/:dayId', attachAccessContext, requireDayReadAccess('dayId'), ctrl.getDay);

module.exports = router;
