const { Router } = require('express');
const authController = require('../controllers/auth.controller');

const router = Router();

router.post('/request-link', authController.requestLink);
router.get('/verify', authController.verify);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

module.exports = router;
