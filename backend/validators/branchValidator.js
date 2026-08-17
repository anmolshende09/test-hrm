const { body } = require("express-validator");
const { validate } = require("./authValidator");

const branchRules = [
  body("name").trim().notEmpty().withMessage("Branch name is required"),
  body("email").optional({ checkFalsy: true }).isEmail().withMessage("A valid email is required"),
  body("status").optional().isIn(["active", "inactive"]).withMessage("Invalid status"),
];

module.exports = { branchRules, validate };
