const Day = require('../models/Day');
const Trip = require('../models/Trip');

exports.findByTrip = (tripId) => Day.find({ tripId }).sort({ date: 1 });

exports.findById = (id) => Day.findById(id);

exports.create = (data) => Day.create(data);

exports.update = (id, data) =>
  Day.findByIdAndUpdate(id, data, { new: true, runValidators: true });

exports.remove = (id) => Day.findByIdAndDelete(id);

/**
 * Create one Day per date in the trip's [startDate, endDate] range, skipping
 * any date that already has a Day (so re-running after adding a day midway
 * through the range doesn't duplicate the rest). Returns the full sorted set.
 */
exports.generateForTrip = async (tripId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) return null;

  const existing = await Day.find({ tripId }).select('date');
  const existingDates = new Set(existing.map((d) => d.date.toISOString().slice(0, 10)));

  const toCreate = [];
  const cursor = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10);
    if (!existingDates.has(key)) {
      toCreate.push({ tripId, date: new Date(cursor) });
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  if (toCreate.length > 0) {
    await Day.insertMany(toCreate);
  }

  return exports.findByTrip(tripId);
};
