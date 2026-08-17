const { body, validationResult } = require("express-validator");

const documentCategoryRules = [
  body("name").trim().notEmpty().withMessage("Category name is required"),
  body("description").optional({ nullable: true }).trim(),
  body("color")
    .optional({ nullable: true, checkFalsy: true })
    .matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/)
    .withMessage("Color must be a valid hex code, e.g. #0066cc"),
  body("icon").optional({ nullable: true }).trim(),
  body("sortOrder").optional({ nullable: true, checkFalsy: true }).isInt().withMessage("Sort order must be a number"),
  body("isMandatory").optional().isBoolean().withMessage("isMandatory must be true or false"),
  body("status").optional().isIn(["active", "inactive"]).withMessage("Status must be active or inactive"),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

module.exports = { documentCategoryRules, validate };