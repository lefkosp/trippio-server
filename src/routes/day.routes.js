const { Router } = require('express');
const ctrl = require('../controllers/day.controller');
const {
  attachAccessContext,
  requireTripReadAccess,
  requireTripWriteAccess,
  requireDayReadAccess,
  requireDayWriteAccess,
} = require('../middleware/accessAuth');

const router = Router();

// Nested under /trips/:tripId
router.get('/trips/:tripId/days', attachAccessContext, requireTripReadAccess('tripId'), ctrl.getDays);
router.post('/trips/:tripId/days', attachAccessContext, requireTripWriteAccess('tripId'), ctrl.createDay);
router.post('/trips/:tripId/days/generate', attachAccessContext, requireTripWriteAccess('tripId'), ctrl.generateDays);

// Direct access
router.get('/days/:dayId', attachAccessContext, requireDayReadAccess('dayId'), ctrl.getDay);
router.patch('/days/:dayId', attachAccessContext, requireDayWriteAccess('dayId'), ctrl.updateDay);

module.exports = router;
