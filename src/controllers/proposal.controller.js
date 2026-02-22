const asyncHandler = require('../middleware/asyncHandler');
const proposalService = require('../services/proposal.service');

function badRequest(res, message) {
  return res.status(400).json({ data: null, error: { message, code: 'BAD_REQUEST' } });
}

function notFound(res, message = 'Proposal not found') {
  return res.status(404).json({ data: null, error: { message, code: 'NOT_FOUND' } });
}

const VALID_STATUSES = ['open', 'approved', 'rejected'];
const VALID_CATEGORIES = ['food', 'activity', 'stay', 'transport', 'other'];

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
  const proposals = await proposalService.listByTrip(tripId, filters);
  return res.json({ data: { proposals }, error: null });
});

exports.createProposal = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const { title, description, category, suggestedDayId, suggestedPlaceId, links } = req.body;

  if (!title || !title.trim()) return badRequest(res, 'Title is required');
  if (!category) return badRequest(res, 'Category is required');
  if (!VALID_CATEGORIES.includes(category)) return badRequest(res, 'Invalid category');

  const proposal = await proposalService.create(
    tripId,
    { title, description, category, suggestedDayId, suggestedPlaceId, links },
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

  if (!value || !['yes', 'no'].includes(value)) {
    return badRequest(res, 'Vote value must be "yes" or "no"');
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
