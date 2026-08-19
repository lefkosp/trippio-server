const asyncHandler = require('../middleware/asyncHandler');
const proposalService = require('../services/proposal.service');

function badRequest(res, message) {
  return res.status(400).json({ data: null, error: { message, code: 'BAD_REQUEST' } });
}

function notFound(res, message = 'Proposal not found') {
  return res.status(404).json({ data: null, error: { message, code: 'NOT_FOUND' } });
}

const VALID_STATUSES = ['open', 'approved', 'rejected', 'promoted'];
const VALID_CATEGORIES = ['food', 'activity', 'stay', 'transport', 'other'];
const VALID_SORTS = ['votes'];

exports.listProposals = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const filters = {};
  if (req.query.status) {
    if (!VALID_STATUSES.includes(req.query.status)) {
      return badRequest(res, 'Invalid status filter');
    }
    filters.status = req.query.status;
  }
  if (req.query.category) {
    if (!VALID_CATEGORIES.includes(req.query.category)) {
      return badRequest(res, 'Invalid category filter');
    }
    filters.category = req.query.category;
  }
  if (req.query.sort) {
    if (!VALID_SORTS.includes(req.query.sort)) {
      return badRequest(res, 'Invalid sort');
    }
    filters.sort = req.query.sort;
  }
  const proposals = await proposalService.listByTrip(tripId, filters);
  return res.json({ data: { proposals }, error: null });
});

exports.createProposal = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const { title, url, description, category, city, tags, source, suggestedDayId, suggestedPlaceId, links } = req.body;

  // Paste-first flow: a bare url is enough to create an item — title falls
  // back to the url's hostname (proposalService.create) and gets overwritten
  // once the link-preview scrape resolves. The full create form still sends
  // title directly. At least one of the two is required.
  if ((!title || !title.trim()) && (!url || !url.trim())) {
    return badRequest(res, 'Title or url is required');
  }
  if (category && !VALID_CATEGORIES.includes(category)) return badRequest(res, 'Invalid category');

  const proposal = await proposalService.create(
    tripId,
    { title, url, description, category, city, tags, source, suggestedDayId, suggestedPlaceId, links },
    req.user.id
  );
  return res.status(201).json({ data: { proposal }, error: null });
});

// ── Proposal-scoped actions ───────────────────────────────────────────────────
// req.resource = loaded Proposal (set by requireResourceWriteAccess)
// req.trip = loaded Trip (set by requireResourceWriteAccess)

exports.voteProposal = asyncHandler(async (req, res) => {
  const { proposalId } = req.params;
  const { value } = req.body;

  if (!value || !['yes', 'maybe', 'no'].includes(value)) {
    return badRequest(res, 'Vote value must be "yes", "maybe", or "no"');
  }

  const proposal = await proposalService.upsertVote(proposalId, req.user.id, value);
  if (!proposal) return notFound(res);
  return res.json({ data: { proposal }, error: null });
});

exports.approveProposal = asyncHandler(async (req, res) => {
  const { proposalId } = req.params;
  const proposal = await proposalService.approve(proposalId, req.user.id);
  if (!proposal) return notFound(res);
  return res.json({ data: { proposal }, error: null });
});

exports.rejectProposal = asyncHandler(async (req, res) => {
  const { proposalId } = req.params;
  const proposal = await proposalService.reject(proposalId, req.user.id);
  if (!proposal) return notFound(res);
  return res.json({ data: { proposal }, error: null });
});

exports.convertProposal = asyncHandler(async (req, res) => {
  const { proposalId } = req.params;
  const { dayId, startTime, endTime, eventType } = req.body;

  if (!dayId) return badRequest(res, 'dayId is required');

  try {
    const result = await proposalService.convertToEvent(proposalId, {
      dayId,
      startTime,
      endTime,
      eventType,
    });
    return res.status(201).json({ data: result, error: null });
  } catch (err) {
    return badRequest(res, err.message);
  }
});

exports.setProposalPreview = asyncHandler(async (req, res) => {
  const { proposalId } = req.params;
  const { title, imageUrl } = req.body;

  if (!title && !imageUrl) return badRequest(res, 'title or imageUrl is required');

  const proposal = await proposalService.setPreview(proposalId, { title, imageUrl });
  if (!proposal) return notFound(res);
  return res.json({ data: { proposal }, error: null });
});

exports.promoteProposal = asyncHandler(async (req, res) => {
  const { proposalId } = req.params;
  const { address, lat, lng, name, notes } = req.body;

  if (!address || !address.trim()) return badRequest(res, 'address is required');

  try {
    const result = await proposalService.promoteToPlace(proposalId, req.user.id, {
      address,
      lat,
      lng,
      name,
      notes,
    });
    if (!result) return notFound(res);
    return res.status(201).json({ data: result, error: null });
  } catch (err) {
    return badRequest(res, err.message);
  }
});
