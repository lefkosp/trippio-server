const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    type: {
      type: String,
      enum: ['flight', 'hotel', 'reservation', 'rail', 'activity', 'other'],
      required: true,
    },
    title: { type: String, required: true },
    confirmationNumber: { type: String },
    date: { type: String },       // YYYY-MM-DD
    startTime: { type: String },  // HH:mm
    location: { type: String },
    links: [{ type: String }],
    notes: { type: String },
  },
  { timestamps: true }
);

bookingSchema.index({ tripId: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
