const ApiError = require('../utils/ApiError');
const config = require('../config');

/**
 * Central Express error handler. Mount LAST, after all routes.
 * Produces a consistent { status:'error', message, details? } envelope and
 * maps common Mongoose/JWT errors to sensible status codes.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = err.details;

  // Mongoose validation / cast / duplicate-key → 400 / 409
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => e.message);
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate value';
    details = err.keyValue;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Log server-side faults (not routine 4xx client errors)
  if (statusCode >= 500) {
    console.error('💥 Unhandled error:', err);
  }

  const body = { status: 'error', message };
  if (details !== undefined) body.details = details;
  if (!config.isProd && statusCode >= 500) body.stack = err.stack;

  res.status(statusCode).json(body);
}

/** 404 handler for unmatched routes — mount just before errorHandler. */
function notFoundHandler(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

module.exports = { errorHandler, notFoundHandler };
