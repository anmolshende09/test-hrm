const { body } = require("express-validator");
const { validate } = require("./authValidator");

const resignationRules = [
  body("employee").isMongoId().withMessage("A valid employee is required"),
  body("resignationDate").optional().isISO8601().withMessage("Resignation date must be valid"),
  body("lastWorkingDay").isISO8601().withMessage("A valid last working day is required"),
  body("status").optional().isIn(["pending", "accepted", "withdrawn"]).withMessage("Invalid status"),
];

module.exports = { resignationRules, validate };
