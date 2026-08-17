const { body } = require("express-validator");
const { validate } = require("./authValidator");

const documentTypeRules = [
  body("name").trim().notEmpty().withMessage("Document type name is required"),
  body("description").optional().trim(),
  body("required").optional().isBoolean().withMessage("Required must be true or false"),
  body("status").optional().isIn(["active", "inactive"]).withMessage("Invalid status"),
];

module.exports = { documentTypeRules, validate };
