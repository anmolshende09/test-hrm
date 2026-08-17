const { body } = require("express-validator");
const { validate } = require("./authValidator");

const terminationRules = [
  body("employee").isMongoId().withMessage("A valid employee is required"),
  body("terminationType")
    .isIn(["performance", "misconduct", "layoff", "end_of_contract", "other"])
    .withMessage("Invalid termination type"),
  body("terminationDate").isISO8601().withMessage("A valid termination date is required"),
  body("noticeDate").optional().isISO8601().withMessage("Notice date must be valid"),
  body("status").optional().isIn(["pending", "finalized"]).withMessage("Invalid status"),
];

module.exports = { terminationRules, validate };
