const asyncHandler = require('../middleware/asyncHandler');
const suggestionService = require('../services/suggestion.service');

exports.getSuggestions = asyncHandler(async (req, res) => {
  const suggestions = await suggestionService.findByTrip(
    req.params.tripId,
    req.query.city
  );
  res.json({ data: suggestions, error: null });
});
