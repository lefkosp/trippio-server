const { Router } = require('express');
const ctrl = require('../controllers/preview.controller');
const { attachAccessContext, requireUserAuth } = require('../middleware/accessAuth');

const router = Router();

// Stateless utility, not trip-scoped — any authenticated user can resolve a
// preview for a link before deciding which trip's inbox to drop it into.
router.post('/link-preview', attachAccessContext, requireUserAuth, ctrl.getPreview);

module.exports = router;
