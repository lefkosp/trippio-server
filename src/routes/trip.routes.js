const { Router } = require('express');
const ctrl = require('../controllers/trip.controller');

const router = Router();

router.get('/', ctrl.getTrips);
router.post('/', ctrl.createTrip);
router.get('/:tripId', ctrl.getTrip);

module.exports = router;
