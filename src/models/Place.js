const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema(
  {
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    googleMapsUrl: { type: String },
    tags: [{ type: String }],
    notes: { type: String },
  },
  { timestamps: true }
);

placeSchema.index({ tripId: 1 });

module.exports = mongoose.model('Place', placeSchema);
