const { body } = require("express-validator");
const { validate } = require("./authValidator");

const employeeSalaryRules = [
  body("employee").isMongoId().withMessage("A valid employee is required"),
  body("basicSalary").isFloat({ min: 0 }).withMessage("Basic salary must be a non-negative number"),
  body("components").optional().isArray().withMessage("Components must be an array"),
  body("components.*.component").optional().isMongoId().withMessage("Each component must be a valid ID"),
  body("status").optional().isIn(["active", "locked"]).withMessage("Invalid status"),
];

module.exports = { employeeSalaryRules, validate };
