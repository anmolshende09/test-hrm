const { body } = require("express-validator");
const { validate } = require("./authValidator");

const createRegularizationRules = [
  body("employee").isMongoId().withMessage("A valid employee is required"),
  body("date").isISO8601().toDate().withMessage("A valid date is required"),
  body("requestedCheckIn")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Requested check-in must be in HH:MM 24-hour format"),
  body("requestedCheckOut")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Requested check-out must be in HH:MM 24-hour format"),
  body("reason").trim().notEmpty().withMessage("Reason is required"),
];

const reviewRegularizationRules = [
  body("status").isIn(["approved", "rejected"]).withMessage("Status must be approved or rejected"),
  body("reviewNote").optional().trim(),
];

module.exports = { createRegularizationRules, reviewRegularizationRules, validate };
