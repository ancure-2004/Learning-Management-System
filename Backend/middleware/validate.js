const ApiError = require('../utils/ApiError');

/**
 * Validate request parts against zod schemas, BEFORE the controller runs.
 *
 *   const { z } = require('zod');
 *   router.post('/', validate({ body: z.object({ name: z.string().min(1) }) }), ctrl.create);
 *
 * On success, replaces req.body/params/query with the parsed (coerced) values.
 * On failure, forwards a 400 ApiError with field-level details to the handler.
 */
function validate(schemas = {}) {
  return (req, res, next) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.params) req.params = schemas.params.parse(req.params);
      if (schemas.query) Object.assign(req.query, schemas.query.parse(req.query));
      next();
    } catch (err) {
      if (err && Array.isArray(err.issues)) {
        const details = err.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
        return next(ApiError.badRequest('Validation failed', details));
      }
      next(err);
    }
  };
}

module.exports = validate;
