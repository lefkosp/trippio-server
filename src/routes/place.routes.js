const { Router } = require('express');
const ctrl = require('../controllers/place.controller');

const router = Router();

router.get('/trips/:tripId/places', ctrl.getPlaces);
router.post('/trips/:tripId/places', ctrl.createPlace);
router.patch('/places/:placeId', ctrl.updatePlace);

module.exports = router;
