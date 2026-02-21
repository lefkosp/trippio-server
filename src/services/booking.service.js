const Booking = require('../models/Booking');

exports.findByTrip = (tripId) => Booking.find({ tripId }).sort({ date: 1 });

exports.findById = (id) => Booking.findById(id);

exports.create = (data) => Booking.create(data);

exports.update = (id, data) =>
  Booking.findByIdAndUpdate(id, data, { new: true, runValidators: true });

exports.remove = (id) => Booking.findByIdAndDelete(id);
