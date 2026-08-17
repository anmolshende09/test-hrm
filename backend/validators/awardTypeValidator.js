const { body } = require("express-validator");
const { validate } = require("./authValidator");

const awardTypeRules = [
  body("name").trim().notEmpty().withMessage("Award type name is required"),
  body("description").optional().trim(),
  body("status").optional().isIn(["active", "inactive"]).withMessage("Invalid status"),
];

module.exports = { awardTypeRules, validate };
