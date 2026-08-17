const { body, validationResult } = require("express-validator");

const systemSettingsRules = [
  body("defaultLanguage").optional().trim().notEmpty(),
  body("dateFormat").optional().trim().notEmpty(),
  body("timeFormat").optional().trim().notEmpty(),
  body("defaultTimezone").optional().trim().notEmpty(),
  body("ipRestriction").optional().isBoolean().withMessage("ipRestriction must be true or false"),
  body("landingPage").optional().isBoolean().withMessage("landingPage must be true or false"),
];

const emailSettingsRules = [
  body("mailDriver").optional().trim().notEmpty().withMessage("Mail Driver is required"),
  body("smtpHost").optional().trim().notEmpty().withMessage("SMTP Host is required"),
  body("smtpPort").optional().trim().notEmpty().withMessage("SMTP Port is required"),
  body("smtpUsername").optional().trim().notEmpty().withMessage("SMTP Username is required"),
  body("fromAddress").optional().trim().isEmail().withMessage("From Address must be a valid email"),
  body("fromName").optional().trim().notEmpty().withMessage("From Name is required"),
];

const testEmailRules = [body("testRecipient").trim().notEmpty().withMessage("Recipient is required").isEmail().withMessage("Enter a valid email")];

const workingDaysRules = [
  body(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"])
    .optional()
    .isBoolean()
    .withMessage("Each day must be true or false"),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

module.exports = { systemSettingsRules, emailSettingsRules, testEmailRules, workingDaysRules, validate };
