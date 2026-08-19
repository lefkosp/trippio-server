const mongoose = require('mongoose');

const daySchema = new mongoose.Schema(
  {
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    date: { type: Date, required: true },
    // Optional: days are generated from the trip's date range before anyone
    // has decided which city they'll be in — city gets assigned during planning.
    city: { type: String, default: '' },
    notes: { type: String, default: '' },
    order: { type: Number },
  },
  { timestamps: true }
);

daySchema.index({ tripId: 1, date: 1 });

module.exports = mongoose.model('Day', daySchema);
