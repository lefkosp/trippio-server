const { Router } = require('express');
const ctrl = require('../controllers/share.controller');
const { optionalAuth } = require('../middleware/accessAuth');

const router = Router();

router.get('/share/:token', optionalAuth, ...ctrl.resolveShareLink);

module.exports = router;
