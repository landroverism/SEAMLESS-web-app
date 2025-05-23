const { validationResult } = require('express-validator');
const { ApiError } = require('./errorHandler');

/**
 * Middleware to validate request using express-validator
 */
exports.validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(new ApiError(errorMessages[0], 400));
  }
  
  next();
};
