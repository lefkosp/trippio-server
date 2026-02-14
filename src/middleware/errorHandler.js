/**
 * Central error handler – returns the standard response envelope.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  console.error('💥  Error:', err.stack || err.message);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    data: null,
    error: {
      message: err.message || 'Internal server error',
      code: err.code || 'INTERNAL_ERROR',
      details: err.details || undefined,
    },
  });
};

module.exports = errorHandler;
