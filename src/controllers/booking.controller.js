const asyncHandler = require('../middleware/asyncHandler');
const bookingService = require('../services/booking.service');

exports.getBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.findByTrip(req.params.tripId);
  res.json({ data: bookings, error: null });
});

exports.createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.create({ ...req.body, tripId: req.params.tripId });
  res.status(201).json({ data: booking, error: null });
});

exports.updateBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.update(req.params.bookingId, req.body);
  if (!booking) {
    return res.status(404).json({
      data: null,
      error: { message: 'Booking not found', code: 'NOT_FOUND' },
    });
  }
  res.json({ data: booking, error: null });
});

exports.deleteBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.remove(req.params.bookingId);
  if (!booking) {
    return res.status(404).json({
      data: null,
      error: { message: 'Booking not found', code: 'NOT_FOUND' },
    });
  }
  res.json({ data: booking, error: null });
});
