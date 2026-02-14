const Place = require('../models/Place');

exports.findByTrip = (tripId, query) => {
  const filter = { tripId };
  if (query) {
    filter.name = { $regex: query, $options: 'i' };
  }
  return Place.find(filter).sort({ name: 1 });
};

exports.findById = (id) => Place.findById(id);

exports.create = (data) => Place.create(data);

exports.update = (id, data) =>
  Place.findByIdAndUpdate(id, data, { new: true, runValidators: true });

exports.remove = (id) => Place.findByIdAndDelete(id);
