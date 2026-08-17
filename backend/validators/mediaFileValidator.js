const { body, validationResult } = require("express-validator");

const mediaFileUpdateRules = [
  body("displayName").optional().trim().notEmpty().withMessage("Display name can't be empty"),
  body("folder").optional({ nullable: true, checkFalsy: true }).isMongoId().withMessage("Invalid folder"),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

module.exports = { mediaFileUpdateRules, validate };