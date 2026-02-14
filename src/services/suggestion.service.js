const Suggestion = require('../models/Suggestion');

exports.findByTrip = (tripId, city) => {
  const filter = { tripId };
  if (city) {
    filter.city = { $regex: `^${city}$`, $options: 'i' };
  }
  return Suggestion.find(filter).sort({ city: 1, title: 1 });
};

exports.findById = (id) => Suggestion.findById(id);

exports.create = (data) => Suggestion.create(data);

exports.update = (id, data) =>
  Suggestion.findByIdAndUpdate(id, data, { new: true, runValidators: true });

exports.remove = (id) => Suggestion.findByIdAndDelete(id);
