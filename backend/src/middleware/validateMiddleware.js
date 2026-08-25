const { errorResponse } = require('../utils/response');

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const errorMessages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        return errorResponse(res, errorMessages, 400, 'VALIDATION_ERROR', err.errors);
      }
      return errorResponse(res, 'Invalid request data', 400, 'VALIDATION_ERROR');
    }
  };
};

module.exports = validate;
