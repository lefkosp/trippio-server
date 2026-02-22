const Proposal = require('../models/Proposal');
const Event = require('../models/Event');
const Day = require('../models/Day');

const CATEGORY_TO_EVENT_TYPE = {
  food: 'food',
  activity: 'sight',
  stay: 'hotel',
  transport: 'transport',
  other: 'free',
};

exports.listByTrip = (tripId, filters = {}) => {
  const query = { tripId };
  if (filters.status) query.status = filters.status;
  if (filters.category) query.category = filters.category;
  return Proposal.find(query)
    .populate('proposedBy', 'email')
    .populate('votes.userId', 'email')
    .sort({ createdAt: -1 });
};

exports.findById = (id) =>
  Proposal.findById(id)
    .populate('proposedBy', 'email')
    .populate('votes.userId', 'email');

exports.create = (tripId, data, userId) =>
  Proposal.create({
    tripId,
    title: data.title,
    description: data.description,
    category: data.category,
    suggestedDayId: data.suggestedDayId || undefined,
    suggestedPlaceId: data.suggestedPlaceId || undefined,
    links: data.links || [],
    proposedBy: userId,
    status: 'open',
    votes: [],
  });

exports.upsertVote = async (proposalId, userId, value) => {
  const proposal = await Proposal.findById(proposalId);
  if (!proposal) return null;

  const idx = proposal.votes.findIndex((v) => String(v.userId) === String(userId));
  if (idx >= 0) {
    proposal.votes[idx].value = value;
    proposal.votes[idx].votedAt = new Date();
  } else {
    proposal.votes.push({ userId, value, votedAt: new Date() });
  }
  await proposal.save();
  return proposal
    .populate('proposedBy', 'email')
    .then(() => proposal.populate('votes.userId', 'email'));
};

exports.approve = async (proposalId, userId) => {
  const proposal = await Proposal.findByIdAndUpdate(
    proposalId,
    {
      status: 'approved',
      approvedBy: userId,
      approvedAt: new Date(),
      rejectedBy: undefined,
      rejectedAt: undefined,
    },
    { new: true, runValidators: true }
  )
    .populate('proposedBy', 'email')
    .populate('votes.userId', 'email');
  return proposal;
};

exports.reject = async (proposalId, userId) => {
  const proposal = await Proposal.findByIdAndUpdate(
    proposalId,
    {
      status: 'rejected',
      rejectedBy: userId,
      rejectedAt: new Date(),
      approvedBy: undefined,
      approvedAt: undefined,
    },
    { new: true, runValidators: true }
  )
    .populate('proposedBy', 'email')
    .populate('votes.userId', 'email');
  return proposal;
};

exports.convertToEvent = async (proposalId, { dayId, startTime, endTime, eventType }) => {
  const proposal = await Proposal.findById(proposalId);
  if (!proposal) return null;

  if (proposal.status !== 'approved') {
    throw new Error('Proposal must be approved before converting to an event');
  }

  const day = await Day.findById(dayId);
  if (!day) throw new Error('Day not found');

  const resolvedType = eventType || CATEGORY_TO_EVENT_TYPE[proposal.category] || 'free';

  const event = await Event.create({
    tripId: proposal.tripId,
    dayId,
    title: proposal.title,
    type: resolvedType,
    placeId: proposal.suggestedPlaceId || undefined,
    links: proposal.links || [],
    startTime: startTime || undefined,
    endTime: endTime || undefined,
    status: 'planned',
    order: 0,
    source: 'proposal',
    proposalId: proposal._id,
  });

  return { event, proposal };
};
