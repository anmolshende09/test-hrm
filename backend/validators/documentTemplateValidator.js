const { body, validationResult } = require("express-validator");

const documentTemplateRules = [
  body("name").trim().notEmpty().withMessage("Template name is required"),
  body("category").notEmpty().withMessage("Category is required").isMongoId().withMessage("Invalid category"),
  body("templateContent").trim().notEmpty().withMessage("Template content is required"),
  body("description").optional({ nullable: true }).trim(),
  body("placeholders").optional().isArray().withMessage("Placeholders must be a list"),
  body("defaultValues").optional().isArray().withMessage("Default values must be a list"),
  body("defaultValues.*.key").optional().trim().notEmpty().withMessage("Default value key is required"),
  body("isDefault").optional().isBoolean().withMessage("isDefault must be true or false"),
  body("fileFormat").optional().isIn(["PDF", "DOC", "DOCX"]).withMessage("Invalid file format"),
  body("status").optional().isIn(["active", "inactive"]).withMessage("Invalid status"),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

module.exports = { documentTemplateRules, validate };