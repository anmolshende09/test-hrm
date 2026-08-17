const { body, validationResult } = require("express-validator");

const currencyRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Currency name is required"),

  body("code")
    .trim()
    .notEmpty()
    .withMessage("Currency code is required")
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency code must be exactly 3 characters"),

  body("symbol")
    .trim()
    .notEmpty()
    .withMessage("Currency symbol is required"),

  body("isDefault")
    .optional()
    .isBoolean()
    .withMessage("Default must be a boolean"),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  next();
};

module.exports = {
  currencyRules,
  validate,
};