const { body, validationResult } = require("express-validator");

const hrDocumentRules = [
  body("title").trim().notEmpty().withMessage("Document title is required"),
  body("category").notEmpty().withMessage("Document category is required").isMongoId().withMessage("Invalid category"),
  body("description").optional({ nullable: true }).trim(),
  body("version").optional({ nullable: true }).trim(),
  body("status").optional().isIn(["draft", "published", "archived"]).withMessage("Invalid status"),
  body("effectiveDate").optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage("Invalid effective date"),
  body("expiryDate").optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage("Invalid expiry date"),
  body("requiresAcknowledgment").optional().isBoolean().withMessage("requiresAcknowledgment must be true or false"),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

module.exports = { hrDocumentRules, validate };