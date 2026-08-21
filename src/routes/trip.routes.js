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
router.post('/import', ...ctrl.importTrip);
router.get('/:tripId', attachAccessContext, requireTripReadAccess('tripId'), ...ctrl.getTrip);
router.get('/:tripId/export', requireAuth, requireTripOwner('tripId'), ...ctrl.exportTrip);
router.delete('/:tripId', requireAuth, requireTripOwner('tripId'), ...ctrl.deleteTrip);
router.post('/:tripId/share-links', requireAuth, requireTripOwner('tripId'), ...shareCtrl.createShareLink);
router.get('/:tripId/share-links', requireAuth, requireTripOwner('tripId'), ...shareCtrl.listShareLinks);
router.post('/:tripId/share-links/:shareLinkId/revoke', requireAuth, requireTripOwner('tripId'), ...shareCtrl.revokeShareLink);
router.get('/:tripId/collaborators', requireAuth, requireTripOwner('tripId'), ...ctrl.getCollaborators);
router.patch('/:tripId/collaborators/:userId', requireAuth, requireTripOwner('tripId'), ...ctrl.updateCollaboratorRole);
router.delete('/:tripId/collaborators/:userId', requireAuth, requireTripOwner('tripId'), ...ctrl.removeCollaborator);

module.exports = router;
