const { body } = require("express-validator");
const { validate } = require("./authValidator");

const payrollRunRules = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("frequency").optional().isIn(["monthly", "bi_weekly", "weekly"]).withMessage("Invalid frequency"),
  body("periodStart").isISO8601().withMessage("A valid period start date is required"),
  body("periodEnd").isISO8601().withMessage("A valid period end date is required"),
  body("payDate").isISO8601().withMessage("A valid pay date is required"),
  body("status").optional().isIn(["draft", "processing", "completed", "cancelled"]).withMessage("Invalid status"),
];

module.exports = { payrollRunRules, validate };
