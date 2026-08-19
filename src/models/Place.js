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
    // China-specific: the Chinese name is what you show a taxi driver or type
    // into a local map app — the Latin name is frequently useless on the
    // ground. metro fields are how you'll actually get there day to day.
    nameZh: { type: String },
    metroStation: { type: String },
    metroLine: { type: String },
    // Major sites (temples, museums) often require booking days ahead, tied
    // to a passport number, and sell out — surfaced as a day-view badge.
    requiresAdvanceBooking: { type: Boolean, default: false },
    bookingWindowDays: { type: Number },
  },
  { timestamps: true }
);

placeSchema.index({ tripId: 1 });

module.exports = mongoose.model('Place', placeSchema);
