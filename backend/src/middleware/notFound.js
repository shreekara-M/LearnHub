const { AppError } = require('@middleware/errorHandler');

function notFound(req, res, next) {
  throw new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND');
}

module.exports = {
  notFound
};