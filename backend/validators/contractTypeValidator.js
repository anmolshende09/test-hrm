const { body, validationResult } = require("express-validator");

const contractTypeRules = [
  body("name").trim().notEmpty().withMessage("Contract type name is required"),
  body("description").optional({ nullable: true }).trim(),
  body("defaultDurationMonths")
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage("Default duration must be a positive number of months"),
  body("probationPeriodMonths")
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage("Probation period must be a positive number of months"),
  body("noticePeriodDays")
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage("Notice period must be a positive number of days"),
  body("isRenewable").optional().isBoolean().withMessage("isRenewable must be true or false"),
  body("status").optional().isIn(["active", "inactive"]).withMessage("Status must be active or inactive"),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

module.exports = { contractTypeRules, validate };