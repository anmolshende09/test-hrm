const { body } = require("express-validator");
const { validate } = require("./authValidator");

const offerRules = [
  body("candidate").isMongoId().withMessage("A valid candidate is required"),
  body("salary").isFloat({ min: 0 }).withMessage("Salary must be a non-negative number"),
  body("startDate").isISO8601().withMessage("A valid start date is required"),
  body("expiryDate").isISO8601().withMessage("A valid expiry date is required"),
  body("status")
    .optional()
    .isIn(["pending", "accepted", "rejected", "withdrawn"])
    .withMessage("Invalid status"),
];

module.exports = { offerRules, validate };
