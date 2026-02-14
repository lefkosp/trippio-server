const { Router } = require('express');
const ctrl = require('../controllers/day.controller');

const router = Router();

// Nested under /trips/:tripId
router.get('/trips/:tripId/days', ctrl.getDays);
router.post('/trips/:tripId/days', ctrl.createDay);

// Direct access
router.get('/days/:dayId', ctrl.getDay);

module.exports = router;
