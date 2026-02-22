const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    value: { type: String, enum: ['yes', 'no'], required: true },
    votedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const proposalSchema = new mongoose.Schema(
  {
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
    title: { type: String, required: true, maxlength: 120, trim: true },
    description: { type: String, maxlength: 800, trim: true },
    category: {
      type: String,
      enum: ['food', 'activity', 'stay', 'transport', 'other'],
      required: true,
    },
    suggestedDayId: { type: mongoose.Schema.Types.ObjectId, ref: 'Day' },
    suggestedPlaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Place' },
    links: [{ type: String }],
    proposedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['open', 'approved', 'rejected'],
      default: 'open',
    },
    votes: [voteSchema],
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Proposal', proposalSchema);
