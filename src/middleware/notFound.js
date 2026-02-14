/**
 * 404 handler – catches requests that didn't match any route.
 */
const notFound = (req, res, _next) => {
  res.status(404).json({
    data: null,
    error: {
      message: `Not found – ${req.method} ${req.originalUrl}`,
      code: 'NOT_FOUND',
    },
  });
};

module.exports = notFound;
