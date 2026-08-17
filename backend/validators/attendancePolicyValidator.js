const { body } = require("express-validator");
const { validate } = require("./authValidator");

const attendancePolicyRules = [
  body("name").trim().notEmpty().withMessage("Policy name is required"),
  body("type").isIn(["standard", "flexible", "strict"]).withMessage("Type must be standard, flexible, or strict"),
  body("lateArrivalGrace").optional().isInt({ min: 0 }).withMessage("Late arrival grace must be a non-negative number of minutes"),
  body("earlyDepartureGrace").optional().isInt({ min: 0 }).withMessage("Early departure grace must be a non-negative number of minutes"),
  body("overtimeRate").optional().isFloat({ min: 0 }).withMessage("Overtime rate must be a non-negative number"),
  body("description").optional().trim(),
  body("status").optional().isIn(["active", "inactive"]).withMessage("Invalid status"),
];

module.exports = { attendancePolicyRules, validate };
