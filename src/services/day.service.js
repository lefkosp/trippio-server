const Day = require('../models/Day');

exports.findByTrip = (tripId) => Day.find({ tripId }).sort({ date: 1 });

exports.findById = (id) => Day.findById(id);

exports.create = (data) => Day.create(data);

exports.update = (id, data) =>
  Day.findByIdAndUpdate(id, data, { new: true, runValidators: true });

exports.remove = (id) => Day.findByIdAndDelete(id);
