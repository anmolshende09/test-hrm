const { body } = require("express-validator");
const { validate } = require("./authValidator");

const jobCategoryRules = [
  body("name").trim().notEmpty().withMessage("Job category name is required"),
  body("description").optional().trim(),
  body("status").optional().isIn(["active", "inactive"]).withMessage("Invalid status"),
];

module.exports = { jobCategoryRules, validate };
