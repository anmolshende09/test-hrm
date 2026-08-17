const { body } = require("express-validator");
const { validate } = require("./authValidator");

const warningRules = [
  body("employee").isMongoId().withMessage("A valid employee is required"),
  body("subject").trim().notEmpty().withMessage("Subject is required"),
  body("warningType").isIn(["verbal", "written", "final_notice"]).withMessage("Invalid warning type"),
  body("severity").optional().isIn(["low", "medium", "high"]).withMessage("Invalid severity"),
  body("date").optional().isISO8601().withMessage("Date must be valid"),
  body("status").optional().isIn(["active", "resolved", "escalated"]).withMessage("Invalid status"),
  body("improvementPlan").optional().trim(),
];

module.exports = { warningRules, validate };
