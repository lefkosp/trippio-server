const mongoose = require('mongoose');

const collaboratorSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    role: { type: String, enum: ['owner', 'editor', 'viewer'], required: true },
  },
  { _id: false }
);

const shareLinkSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true },
    role: { type: String, enum: ['viewer', 'editor'], required: true },
    expiresAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const tripSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    timezone: { type: String, default: 'Asia/Tokyo' },
    createdBy: { type: String, default: 'seed-user' },
    collaborators: [collaboratorSchema],
    shareLinks: [shareLinkSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trip', tripSchema);
