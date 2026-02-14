const { Router } = require('express');
const ctrl = require('../controllers/suggestion.controller');

const router = Router();

router.get('/trips/:tripId/suggestions', ctrl.getSuggestions);

module.exports = router;
