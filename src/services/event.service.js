const Event = require('../models/Event');

exports.findByDay = (dayId) => Event.find({ dayId }).sort({ order: 1 });

exports.findById = (id) => Event.findById(id);

exports.create = (data) => Event.create(data);

exports.update = (id, data) =>
  Event.findByIdAndUpdate(id, data, { new: true, runValidators: true });

exports.remove = (id) => Event.findByIdAndDelete(id);
