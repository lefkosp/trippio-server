const mongoose = require('mongoose');

const tripShareLinkSchema = new mongoose.Schema(
  {
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    tokenHash: { type: String, required: true, unique: true },
    role: { type: String, enum: ['viewer', 'editor'], default: 'viewer', required: true },
    expiresAt: { type: Date },
    revokedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

tripShareLinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('TripShareLink', tripShareLinkSchema);
