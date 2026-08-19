const Proposal = require('../models/Proposal');
const Place = require('../models/Place');
const Event = require('../models/Event');
const Day = require('../models/Day');

const CATEGORY_TO_EVENT_TYPE = {
  food: 'food',
  activity: 'sight',
  stay: 'hotel',
  transport: 'transport',
  other: 'free',
};

const SOURCE_HOST_PATTERNS = [
  [/(^|\.)instagram\.com$/i, 'instagram'],
  [/(^|\.)tiktok\.com$/i, 'tiktok'],
  [/(^|\.)(xiaohongshu\.com|xhslink\.com)$/i, 'xhs'],
  [/(^|\.)(youtube\.com|youtu\.be)$/i, 'youtube'],
];

function inferSourceFromUrl(url) {
  try {
    const hostname = new URL(url).hostname;
    const match = SOURCE_HOST_PATTERNS.find(([pattern]) => pattern.test(hostname));
    return match ? match[1] : 'web';
  } catch {
    return 'manual';
  }
}

function fallbackTitleFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

exports.listByTrip = async (tripId, filters = {}) => {
  const query = { tripId };
  if (filters.status) query.status = filters.status;
  if (filters.category) query.category = filters.category;

  const proposals = await Proposal.find(query)
    .populate('proposedBy', 'email')
    .populate('votes.userId', 'email')
    .sort({ createdAt: -1 });

  if (filters.sort !== 'votes') return proposals;

  // Sort the shortlist by consensus (yes-votes) rather than recency — this is
  // what turns the inbox into a shortlist once reactions start coming in.
  // Array#sort is stable, so ties keep the createdAt DESC order above.
  return proposals
    .slice()
    .sort((a, b) => countYes(b) - countYes(a));
};

function countYes(proposal) {
  return proposal.votes.filter((v) => v.value === 'yes').length;
}

exports.findById = (id) =>
  Proposal.findById(id)
    .populate('proposedBy', 'email')
    .populate('votes.userId', 'email');

exports.create = (tripId, data, userId) => {
  const url = data.url ? data.url.trim() : undefined;
  const title = data.title && data.title.trim()
    ? data.title.trim()
    : url
      ? fallbackTitleFromUrl(url)
      : undefined;
  const source = data.source || (url ? inferSourceFromUrl(url) : 'manual');

  return Proposal.create({
    tripId,
    title,
    description: data.description,
    category: data.category || 'other',
    url,
    imageUrl: data.imageUrl,
    source,
    city: data.city,
    tags: data.tags || [],
    suggestedDayId: data.suggestedDayId || undefined,
    suggestedPlaceId: data.suggestedPlaceId || undefined,
    links: data.links || [],
    proposedBy: userId,
    status: 'open',
    votes: [],
  });
};

exports.setPreview = (proposalId, { title, imageUrl }) =>
  Proposal.findByIdAndUpdate(
    proposalId,
    {
      ...(title ? { title } : {}),
      ...(imageUrl ? { imageUrl } : {}),
    },
    { new: true, runValidators: true }
  )
    .populate('proposedBy', 'email')
    .populate('votes.userId', 'email');

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

exports.promoteToPlace = async (proposalId, userId, { address, lat, lng, name, notes } = {}) => {
  const proposal = await Proposal.findById(proposalId);
  if (!proposal) return null;

  // Idempotent: re-promoting an already-promoted proposal just returns the
  // existing place instead of erroring or creating a duplicate.
  if (proposal.placeId) {
    const place = await Place.findById(proposal.placeId);
    await proposal.populate('proposedBy', 'email');
    await proposal.populate('votes.userId', 'email');
    return { place, proposal };
  }

  if (!address || !address.trim()) {
    throw new Error('address is required to promote a proposal to a place');
  }

  const place = await Place.create({
    tripId: proposal.tripId,
    name: name?.trim() || proposal.title,
    address: address.trim(),
    lat,
    lng,
    tags: proposal.tags || [],
    notes: notes || proposal.description || undefined,
  });

  proposal.status = 'promoted';
  proposal.placeId = place._id;
  proposal.promotedBy = userId;
  proposal.promotedAt = new Date();
  await proposal.save();
  await proposal.populate('proposedBy', 'email');
  await proposal.populate('votes.userId', 'email');

  return { place, proposal };
};
