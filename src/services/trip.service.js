const Trip = require('../models/Trip');

exports.findAll = (userId) =>
  Trip.find({
    $or: [{ createdBy: userId }, { 'collaborators.userId': userId }],
  }).sort({ startDate: -1 });

exports.findById = (id) => Trip.findById(id);

exports.create = (data, userId) =>
  Trip.create({ ...data, createdBy: userId || data.createdBy });

exports.update = (id, data) =>
  Trip.findByIdAndUpdate(id, data, { new: true, runValidators: true });

exports.remove = (id) => Trip.findByIdAndDelete(id);
