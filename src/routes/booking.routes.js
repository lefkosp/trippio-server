const { Router } = require('express');
const ctrl = require('../controllers/booking.controller');
const { Booking } = require('../models');
const {
  attachAccessContext,
  requireTripReadAccess,
  requireTripWriteAccess,
  requireResourceWriteAccess,
} = require('../middleware/accessAuth');

const router = Router();

router.get('/trips/:tripId/bookings', attachAccessContext, requireTripReadAccess('tripId'), ctrl.getBookings);
router.post('/trips/:tripId/bookings', attachAccessContext, requireTripWriteAccess('tripId'), ctrl.createBooking);
router.patch(
  '/bookings/:bookingId',
  attachAccessContext,
  requireResourceWriteAccess(Booking, 'bookingId', { notFoundMessage: 'Booking not found' }),
  ctrl.updateBooking
);
router.delete(
  '/bookings/:bookingId',
  attachAccessContext,
  requireResourceWriteAccess(Booking, 'bookingId', { notFoundMessage: 'Booking not found' }),
  ctrl.deleteBooking
);

module.exports = router;
