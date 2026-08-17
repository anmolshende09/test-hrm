const { body, validationResult } = require("express-validator");

const trainingProgramRules = [
  body("name").trim().notEmpty().withMessage("Program name is required"),
  body("trainingType").notEmpty().withMessage("Training type is required").isMongoId().withMessage("Invalid training type"),
  body("durationHours").notEmpty().withMessage("Duration is required").isFloat({ min: 0 }).withMessage("Duration must be a positive number"),
  body("capacity").notEmpty().withMessage("Capacity is required").isInt({ min: 1 }).withMessage("Capacity must be at least 1"),
  body("trainerName").trim().notEmpty().withMessage("Trainer name is required"),
  body("description").optional({ nullable: true }).trim(),
  body("cost").optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }).withMessage("Cost must be a positive number"),
  body("trainerType").optional().isIn(["internal", "external"]).withMessage("Trainer type must be internal or external"),
  body("status").optional().isIn(["draft", "active", "completed", "cancelled"]).withMessage("Invalid status"),
  body("selfEnrollment").optional().isBoolean().withMessage("selfEnrollment must be true or false"),
  body("mandatory").optional().isBoolean().withMessage("mandatory must be true or false"),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

module.exports = { trainingProgramRules, validate };
