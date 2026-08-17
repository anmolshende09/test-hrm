const { body } = require("express-validator");
const { validate } = require("./authValidator");

const timeFormat = /^([01]\d|2[0-3]):([0-5]\d)$/;

const shiftRules = [
  body("name").trim().notEmpty().withMessage("Shift name is required"),
  body("startTime").matches(timeFormat).withMessage("Start time must be in HH:MM 24-hour format"),
  body("endTime").matches(timeFormat).withMessage("End time must be in HH:MM 24-hour format"),
  body("breakDuration").optional().isInt({ min: 0 }).withMessage("Break duration must be a non-negative number of minutes"),
  body("gracePeriod").optional().isInt({ min: 0 }).withMessage("Grace period must be a non-negative number of minutes"),
  body("description").optional().trim(),
  body("status").optional().isIn(["active", "inactive"]).withMessage("Invalid status"),
];

module.exports = { shiftRules, validate };
