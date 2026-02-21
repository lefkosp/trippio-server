const { Router } = require('express');
const ctrl = require('../controllers/trip.controller');
const shareCtrl = require('../controllers/share.controller');
const requireAuth = require('../middleware/requireAuth');
const {
  attachAccessContext,
  requireTripReadAccess,
  requireTripOwner,
} = require('../middleware/accessAuth');

const router = Router();

router.get('/', ...ctrl.getTrips);
router.post('/', ...ctrl.createTrip);
router.get('/:tripId', attachAccessContext, requireTripReadAccess('tripId'), ...ctrl.getTrip);
router.post('/:tripId/share-links', requireAuth, requireTripOwner('tripId'), ...shareCtrl.createShareLink);

module.exports = router;
