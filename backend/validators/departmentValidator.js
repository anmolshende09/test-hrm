const { body } = require("express-validator");
const { validate } = require("./authValidator");

const departmentRules = [
  body("name").trim().notEmpty().withMessage("Department name is required"),
  body("branch").optional({ checkFalsy: true }).isMongoId().withMessage("Branch must be valid"),
  body("status").optional().isIn(["active", "inactive"]).withMessage("Invalid status"),
];

module.exports = { departmentRules, validate };
