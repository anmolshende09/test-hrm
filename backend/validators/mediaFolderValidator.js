const { body, validationResult } = require("express-validator");

const mediaFolderRules = [body("name").trim().notEmpty().withMessage("Folder name is required")];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

module.exports = { mediaFolderRules, validate };