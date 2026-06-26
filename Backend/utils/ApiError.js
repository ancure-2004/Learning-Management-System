/**
 * Operational error with an HTTP status code. Throw these from services/routes;
 * the central error handler turns them into clean JSON responses.
 *
 *   throw new ApiError(404, 'Class not found');
 */
class ApiError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg, details) { return new ApiError(400, msg, details); }
  static unauthorized(msg = 'Not authenticated') { return new ApiError(401, msg); }
  static forbidden(msg = 'Access denied') { return new ApiError(403, msg); }
  static notFound(msg = 'Resource not found') { return new ApiError(404, msg); }
  static badGateway(msg, details) { return new ApiError(502, msg, details); }
}

module.exports = ApiError;
