const { Router } = require('express');
const ctrl = require('../controllers/proposal.controller');
const { Proposal } = require('../models');
const {
  attachAccessContext,
  requireTripReadAccess,
  requireTripWriteAccess,
  requireResourceWriteAccess,
} = require('../middleware/accessAuth');

const router = Router();

// ── Trip-scoped ───────────────────────────────────────────────────────────────

router.get(
  '/trips/:tripId/proposals',
  attachAccessContext,
  requireTripReadAccess('tripId'),
  ctrl.listProposals
);

router.post(
  '/trips/:tripId/proposals',
  attachAccessContext,
  requireTripWriteAccess('tripId'),
  ctrl.createProposal
);

// ── Proposal-scoped ───────────────────────────────────────────────────────────
// requireResourceWriteAccess loads the Proposal, sets req.resource + req.trip,
// and enforces owner/editor access (no share tokens).

const proposalWriteAccess = [
  attachAccessContext,
  requireResourceWriteAccess(Proposal, 'proposalId', { notFoundMessage: 'Proposal not found' }),
];

router.post('/proposals/:proposalId/votes', ...proposalWriteAccess, ctrl.voteProposal);
router.post('/proposals/:proposalId/approve', ...proposalWriteAccess, ctrl.approveProposal);
router.post('/proposals/:proposalId/reject', ...proposalWriteAccess, ctrl.rejectProposal);
router.post('/proposals/:proposalId/convert', ...proposalWriteAccess, ctrl.convertProposal);

module.exports = router;
