const { body, validationResult } = require("express-validator");

const employeeTrainingRules = [
  body("employee").notEmpty().withMessage("Employee is required").isMongoId().withMessage("Invalid employee"),
  body("trainingProgram").notEmpty().withMessage("Training program is required").isMongoId().withMessage("Invalid training program"),
  body("status").optional().isIn(["enrolled", "in_progress", "completed"]).withMessage("Invalid status"),
  body("assignedDate").notEmpty().withMessage("Assigned date is required").isISO8601().withMessage("Invalid assigned date"),
  body("completionDate").optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage("Invalid completion date"),
  body("score").optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0, max: 100 }).withMessage("Score must be between 0 and 100"),
  body("result").optional({ nullable: true, checkFalsy: true }).isIn(["passed", "failed"]).withMessage("Result must be passed or failed"),
];

const bulkAssignRules = [
  body("employees").isArray({ min: 1 }).withMessage("At least one employee is required"),
  body("employees.*").isMongoId().withMessage("Invalid employee"),
  body("trainingProgram").notEmpty().withMessage("Training program is required").isMongoId().withMessage("Invalid training program"),
  body("assignedDate").notEmpty().withMessage("Assigned date is required").isISO8601().withMessage("Invalid assigned date"),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

module.exports = { employeeTrainingRules, bulkAssignRules, validate };
