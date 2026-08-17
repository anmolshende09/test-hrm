const { body, validationResult } = require("express-validator");

const createUserRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Enter a valid email"),
  body("password").notEmpty().withMessage("Password is required").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) throw new Error("Passwords do not match");
    return true;
  }),
  body("role").notEmpty().withMessage("Role is required").isIn(["admin", "hr_manager", "employee"]).withMessage("Invalid role"),
];

const updateUserRules = [
  body("name").optional().trim().notEmpty().withMessage("Name can't be empty"),
  body("email").optional().trim().isEmail().withMessage("Enter a valid email"),
  body("role").optional().isIn(["admin", "hr_manager", "employee"]).withMessage("Invalid role"),
];

const passwordRules = [
  body("newPassword").notEmpty().withMessage("Password is required").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) throw new Error("Passwords do not match");
    return true;
  }),
];

const statusRules = [body("isActive").isBoolean().withMessage("isActive must be true or false")];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

module.exports = { createUserRules, updateUserRules, passwordRules, statusRules, validate };
