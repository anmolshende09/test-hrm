const { body } = require("express-validator");
const { validate } = require("./authValidator");

const salaryComponentRules = [
  body("name").trim().notEmpty().withMessage("Component name is required"),
  body("type").isIn(["earning", "deduction"]).withMessage("Type must be earning or deduction"),
  body("calculationType").isIn(["fixed", "percentage"]).withMessage("Calculation type must be fixed or percentage"),
  body("amount").isFloat({ min: 0 }).withMessage("Amount must be a non-negative number"),
  body("description").optional().trim(),
  body("status").optional().isIn(["active", "inactive", "locked"]).withMessage("Invalid status"),
];

module.exports = { salaryComponentRules, validate };
