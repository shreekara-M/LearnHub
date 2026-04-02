const { Prisma } = require('@prisma/client');
const logger = require('@utils/logger');

class AppError extends Error {
  constructor(message, statusCode = 500, code = 'ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

function mapPrismaError(error) {
  if (!error) {
    return null;
  }

  if (error.code === 'P2002') {
    return new AppError('Resource already exists.', 409, 'CONFLICT');
  }

  if (error.code === 'P2025') {
    return new AppError('Resource not found.', 404, 'NOT_FOUND');
  }

  if (error.code === 'P2003') {
    return new AppError('Invalid reference provided.', 400, 'INVALID_REFERENCE');
  }

  if (error.code === 'P2014') {
    return new AppError('Invalid relation operation.', 400, 'INVALID_RELATION');
  }

  if (error.code === 'P2016') {
    return new AppError('Database query interpretation error.', 400, 'QUERY_ERROR');
  }

  if (error.code === 'P2034') {
    return new AppError('Transaction conflict occurred. Retry the request.', 409, 'TRANSACTION_CONFLICT');
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new AppError('Database validation failed.', 400, 'BAD_REQUEST');
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return new AppError('Database service unavailable.', 503, 'SERVICE_UNAVAILABLE');
  }

  return null;
}

function errorHandler(err, req, res, next) {
  const prismaMappedError = mapPrismaError(err);
  const error = prismaMappedError || err;

  const statusCode = error.statusCode || 500;
  const code = error.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'ERROR');
  const message = error.message || 'Internal server error.';

  if (statusCode >= 500) {
    logger.error(
      {
        err,
        method: req.method,
        url: req.originalUrl,
        statusCode
      },
      'Unexpected server error'
    );
  }

  const response = {
    success: false,
    code,
    message
  };

  if (process.env.NODE_ENV !== 'production' && error.stack) {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = {
  errorHandler,
  AppError
};