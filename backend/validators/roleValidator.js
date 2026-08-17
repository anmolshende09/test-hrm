const { body, validationResult } = require("express-validator");

const roleRules = [
  body("name").trim().notEmpty().withMessage("Role name is required"),
  body("description").optional({ nullable: true }).trim(),
  body("permissions").optional().isArray().withMessage("Permissions must be a list"),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

module.exports = { roleRules, validate };
