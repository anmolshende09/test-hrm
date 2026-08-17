const { body } = require("express-validator");
const { validate } = require("./authValidator");

const promotionRules = [
  body("employee").isMongoId().withMessage("A valid employee is required"),
  body("newDesignation").isMongoId().withMessage("A valid new designation is required"),
  body("effectiveDate").isISO8601().withMessage("A valid effective date is required"),
  body("status").optional().isIn(["pending", "approved", "rejected"]).withMessage("Invalid status"),
];

module.exports = { promotionRules, validate };
