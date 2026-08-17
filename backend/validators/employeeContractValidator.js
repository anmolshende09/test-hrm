const { body, validationResult } = require("express-validator");

const employeeContractRules = [
  body("contractNumber").trim().notEmpty().withMessage("Contract number is required"),
  body("employee").notEmpty().withMessage("Employee is required").isMongoId().withMessage("Invalid employee"),
  body("contractType").notEmpty().withMessage("Contract type is required").isMongoId().withMessage("Invalid contract type"),
  body("startDate").notEmpty().withMessage("Start date is required").isISO8601().withMessage("Invalid start date"),
  body("endDate").optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage("Invalid end date"),
  body("basicSalary").optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }).withMessage("Basic salary must be a positive number"),
  body("allowances").optional().isArray().withMessage("Allowances must be a list"),
  body("allowances.*.name").optional().trim().notEmpty().withMessage("Allowance name is required"),
  body("allowances.*.amount").optional().isFloat({ min: 0 }).withMessage("Allowance amount must be a positive number"),
  body("benefits").optional().isArray().withMessage("Benefits must be a list"),
  body("termsAndConditions").optional({ nullable: true }).trim(),
  body("status").optional().isIn(["draft", "active", "expired", "terminated"]).withMessage("Invalid status"),
];

const renewRules = [
  body("newEndDate").notEmpty().withMessage("A new end date is required").isISO8601().withMessage("Invalid end date"),
  body("note").optional({ nullable: true }).trim(),
];

const amendmentRules = [body("description").trim().notEmpty().withMessage("Amendment description is required")];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

module.exports = { employeeContractRules, renewRules, amendmentRules, validate };