const { body } = require("express-validator");
const { validate } = require("./authValidator");

const calendarEventRules = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("category").isIn(["holiday", "meeting"]).withMessage("Category must be 'holiday' or 'meeting'"),
  body("startDate").isISO8601().toDate().withMessage("A valid start date is required"),
  body("endDate").optional().isISO8601().toDate().withMessage("End date must be a valid date"),
  body("description").optional().trim(),
];

module.exports = { calendarEventRules, validate };
