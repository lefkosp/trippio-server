const { Trip, Day, Event, Place, Booking, Suggestion, Proposal, TripShareLink } = require('../models');

exports.findAll = (userId) =>
  Trip.find({
    $or: [{ createdBy: userId }, { 'collaborators.userId': userId }],
  })
    .sort({ startDate: -1 })
    .lean();

exports.findById = (id) => Trip.findById(id);

exports.create = (data, userId) =>
  Trip.create({ ...data, createdBy: userId || data.createdBy });

exports.update = (id, data) =>
  Trip.findByIdAndUpdate(id, data, { new: true, runValidators: true });

exports.remove = (id) => Trip.findByIdAndDelete(id);

/**
 * Delete a trip and all associated documents. Owner-only; callers must enforce auth.
 * Order: Events (depend on Days), Days, Places, Bookings, Suggestions, Proposals, TripShareLinks, Trip.
 * Idempotent: returns 404 if trip does not exist.
 */
exports.deleteTripAndRelated = async (tripId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) return null;

  await Promise.all([
    Event.deleteMany({ tripId }),
    Day.deleteMany({ tripId }),
    Place.deleteMany({ tripId }),
    Booking.deleteMany({ tripId }),
    Suggestion.deleteMany({ tripId }),
    Proposal.deleteMany({ tripId }),
    TripShareLink.deleteMany({ tripId }),
  ]);

  await Trip.findByIdAndDelete(tripId);
  return { ok: true };
};
