const { body } = require("express-validator");
const { validate } = require("./authValidator");

const designationRules = [
  body("name").trim().notEmpty().withMessage("Designation name is required"),
  body("department").isMongoId().withMessage("A valid department is required"),
  body("status").optional().isIn(["active", "inactive"]).withMessage("Invalid status"),
];

module.exports = { designationRules, validate };
