const { body, validationResult } = require("express-validator");

const trainingTypeRules = [
  body("name").trim().notEmpty().withMessage("Training type name is required"),
  body("branch").notEmpty().withMessage("Branch is required").isMongoId().withMessage("Invalid branch"),
  body("description").optional({ nullable: true }).trim(),
  body("durationHours").optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }).withMessage("Duration must be a positive number"),
  body("departments").optional().isArray().withMessage("Departments must be a list"),
  body("departments.*").optional().isMongoId().withMessage("Invalid department"),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

module.exports = { trainingTypeRules, validate };
