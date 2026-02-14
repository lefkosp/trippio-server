const mongoose = require('mongoose');

const daySchema = new mongoose.Schema(
  {
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    date: { type: Date, required: true },
    city: { type: String, required: true },
    notes: { type: String, default: '' },
    order: { type: Number },
  },
  { timestamps: true }
);

daySchema.index({ tripId: 1, date: 1 });

module.exports = mongoose.model('Day', daySchema);
