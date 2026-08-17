const { body } = require("express-validator");
const { validate } = require("./authValidator");

const jobTypeRules = [
  body("name").trim().notEmpty().withMessage("Job type name is required"),
  body("description").optional().trim(),
  body("status").optional().isIn(["active", "inactive"]).withMessage("Invalid status"),
];

module.exports = { jobTypeRules, validate };
