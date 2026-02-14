const Trip = require('../models/Trip');

exports.findAll = () => Trip.find().sort({ startDate: -1 });

exports.findById = (id) => Trip.findById(id);

exports.create = (data) => Trip.create(data);

exports.update = (id, data) =>
  Trip.findByIdAndUpdate(id, data, { new: true, runValidators: true });

exports.remove = (id) => Trip.findByIdAndDelete(id);
