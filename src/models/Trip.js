const mongoose = require('mongoose');

const collaboratorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['editor', 'viewer'], required: true },
    addedAt: { type: Date, default: Date.now },
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

const preferencesSchema = new mongoose.Schema(
  {
    destinationCity: { type: String, required: true },
    destinationCountry: { type: String },
    pace: { type: String, enum: ['relaxed', 'balanced', 'packed'], required: true },
    dailyStructure: { type: String, enum: ['morning-heavy', 'evening-heavy', 'mixed'] },
    interests: { type: [String], default: [] },
    budgetLevel: { type: String, enum: ['low', 'mid', 'high'], required: true },
    transportPreference: { type: String, enum: ['publicTransport', 'mixed', 'taxis'] },
    notes: { type: String },
    groupSize: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const tripSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    timezone: { type: String, default: 'Asia/Tokyo' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    collaborators: [collaboratorSchema],
    shareLinks: [shareLinkSchema],
    preferences: { type: preferencesSchema },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trip', tripSchema);
