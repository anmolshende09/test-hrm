const { body } = require("express-validator");
const { validate } = require("./authValidator");

const announcementRules = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("category")
    .optional()
    .isIn(["general", "policy", "event", "urgent", "celebration"])
    .withMessage("Invalid category"),
  body("priority").optional().isIn(["low", "medium", "high"]).withMessage("Invalid priority"),
  body("audienceType")
    .optional()
    .isIn(["company_wide", "branch", "department"])
    .withMessage("Invalid audience type"),
  body("startDate").optional().isISO8601().toDate().withMessage("Start date must be a valid date"),
  body("endDate").optional().isISO8601().toDate().withMessage("End date must be a valid date"),
];

module.exports = { announcementRules, validate };
