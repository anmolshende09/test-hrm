const { body, validationResult } = require("express-validator");

const contractTemplateRules = [
  body("name").trim().notEmpty().withMessage("Template name is required"),
  body("contractType").notEmpty().withMessage("Contract type is required").isMongoId().withMessage("Invalid contract type"),
  body("templateContent").trim().notEmpty().withMessage("Template content is required"),
  body("description").optional({ nullable: true }).trim(),
  body("variables").optional().isArray().withMessage("Variables must be a list"),
  body("clauses").optional().isArray().withMessage("Clauses must be a list"),
  body("isDefault").optional().isBoolean().withMessage("isDefault must be true or false"),
  body("status").optional().isIn(["active", "inactive"]).withMessage("Invalid status"),
];

const generateContractRules = [
  body("employee").notEmpty().withMessage("Employee is required").isMongoId().withMessage("Invalid employee"),
  body("contractNumber").trim().notEmpty().withMessage("Contract number is required"),
  body("startDate").notEmpty().withMessage("Start date is required").isISO8601().withMessage("Invalid start date"),
  body("endDate").optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage("Invalid end date"),
  body("basicSalary").optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }).withMessage("Basic salary must be a positive number"),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

module.exports = { contractTemplateRules, generateContractRules, validate };