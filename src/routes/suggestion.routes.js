const { Router } = require('express');
const ctrl = require('../controllers/suggestion.controller');
const { attachAccessContext, requireTripReadAccess } = require('../middleware/accessAuth');

const router = Router();

router.get('/trips/:tripId/suggestions', attachAccessContext, requireTripReadAccess('tripId'), ctrl.getSuggestions);

module.exports = router;
