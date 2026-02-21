const { attachAccessContext, requireUserAuth } = require('./accessAuth');

module.exports = function requireAuth(req, res, next) {
  attachAccessContext(req, res, (err) => {
    if (err) return next(err);
    return requireUserAuth(req, res, next);
  });
};
