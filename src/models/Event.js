const mongoose = require('mongoose');

const transitSchema = new mongoose.Schema(
  {
    mode: { type: String, enum: ['train', 'uber', 'walk', 'bus', 'other'], default: 'walk' },
    from: { type: String },
    to: { type: String },
    instructions: { type: String },
    links: [{ type: String }],
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    dayId: { type: mongoose.Schema.Types.ObjectId, ref: 'Day', required: true },
    title: { type: String, required: true },
    startTime: { type: String },  // HH:mm format
    endTime: { type: String },    // HH:mm format
    type: {
      type: String,
      enum: ['sight', 'food', 'transport', 'hotel', 'free'],
      default: 'sight',
    },
    placeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Place' },
    transit: { type: transitSchema, default: () => ({}) },
    links: [{ type: String }],
    order: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['planned', 'done', 'skipped'],
      default: 'planned',
    },
    notes: { type: String },
  },
  { timestamps: true }
);

eventSchema.index({ dayId: 1, order: 1 });
eventSchema.index({ tripId: 1 });

module.exports = mongoose.model('Event', eventSchema);
