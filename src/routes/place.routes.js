const { Router } = require('express');
const ctrl = require('../controllers/place.controller');
const { Place } = require('../models');
const {
  attachAccessContext,
  requireTripReadAccess,
  requireTripWriteAccess,
  requireResourceWriteAccess,
} = require('../middleware/accessAuth');

const router = Router();

router.get('/trips/:tripId/places', attachAccessContext, requireTripReadAccess('tripId'), ctrl.getPlaces);
router.post('/trips/:tripId/places', attachAccessContext, requireTripWriteAccess('tripId'), ctrl.createPlace);
router.patch(
  '/places/:placeId',
  attachAccessContext,
  requireResourceWriteAccess(Place, 'placeId', { notFoundMessage: 'Place not found' }),
  ctrl.updatePlace
);

module.exports = router;
