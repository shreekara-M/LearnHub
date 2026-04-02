const { validationResult } = require('express-validator');

function validate(rules) {
  return async function validateRequest(req, res, next) {
    await Promise.all(rules.map((rule) => rule.run(req)));

    const result = validationResult(req);

    if (result.isEmpty()) {
      next();
      return;
    }

    const errors = result.array({ onlyFirstError: true }).map((error) => ({
      field: error.path,
      message: error.msg
    }));

    res.status(422).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Input validation failed.',
      errors
    });
  };
}

module.exports = {
  validate
};