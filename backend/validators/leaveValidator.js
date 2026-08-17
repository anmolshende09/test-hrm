const { body } = require("express-validator");
const { validate } = require("./authValidator");

const applyLeaveRules = [
  body("leaveType").isIn(["sick", "casual", "annual", "unpaid", "other"]).withMessage("Invalid leave type"),
  body("startDate").isISO8601().toDate().withMessage("A valid start date is required"),
  body("endDate").isISO8601().toDate().withMessage("A valid end date is required"),
  body("reason").trim().notEmpty().withMessage("Reason is required"),
];

const reviewLeaveRules = [
  body("status").isIn(["approved", "rejected"]).withMessage("Status must be approved or rejected"),
  body("reviewNote").optional().trim(),
];

module.exports = { applyLeaveRules, reviewLeaveRules, validate };
