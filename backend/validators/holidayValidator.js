const { body } = require("express-validator");
const { validate } = require("./authValidator");

const holidayRules = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("holidayCategory")
    .isIn(["national", "company_specific", "religious"])
    .withMessage("Category must be national, company_specific, or religious"),
  body("startDate").isISO8601().toDate().withMessage("A valid start date is required"),
  body("endDate").optional().isISO8601().toDate().withMessage("End date must be a valid date"),
  body("description").optional().trim(),
  body("branches").optional().isArray().withMessage("Branches must be a list of branch IDs"),
  body("branches.*").optional().isMongoId().withMessage("Each branch must be a valid branch"),
];

module.exports = { holidayRules, validate };
