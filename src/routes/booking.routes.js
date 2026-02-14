const { Router } = require('express');
const ctrl = require('../controllers/booking.controller');

const router = Router();

router.get('/trips/:tripId/bookings', ctrl.getBookings);
router.post('/trips/:tripId/bookings', ctrl.createBooking);
router.patch('/bookings/:bookingId', ctrl.updateBooking);
router.delete('/bookings/:bookingId', ctrl.deleteBooking);

module.exports = router;
