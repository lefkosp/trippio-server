const asyncHandler = require('../middleware/asyncHandler');
const previewService = require('../services/preview.service');

function badRequest(res, message) {
  return res.status(400).json({ data: null, error: { message, code: 'BAD_REQUEST' } });
}

function isHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

exports.getPreview = asyncHandler(async (req, res) => {
  const { url } = req.body;
  if (!url || !isHttpUrl(url)) return badRequest(res, 'A valid http(s) url is required');

  const preview = await previewService.fetchPreview(url);
  return res.json({ data: preview, error: null });
});
