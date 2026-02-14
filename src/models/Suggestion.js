const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema(
  {
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    city: { type: String, required: true },
    title: { type: String, required: true },
    placeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Place' },
    type: { type: String },
    why: { type: String },
    links: [{ type: String }],
  },
  { timestamps: true }
);

suggestionSchema.index({ tripId: 1, city: 1 });

module.exports = mongoose.model('Suggestion', suggestionSchema);
