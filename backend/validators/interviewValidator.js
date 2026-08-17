const { body } = require("express-validator");
const { validate } = require("./authValidator");

const interviewRules = [
  body("candidate").isMongoId().withMessage("A valid candidate is required"),
  body("round").trim().notEmpty().withMessage("Interview round is required"),
  body("type").isIn(["phone", "video", "in_person"]).withMessage("Invalid interview type"),
  body("scheduledAt").isISO8601().withMessage("A valid date and time is required"),
  body("location").optional().trim(),
  body("status")
    .optional()
    .isIn(["scheduled", "completed", "cancelled", "rescheduled"])
    .withMessage("Invalid status"),
  body("feedback").optional().trim(),
];

module.exports = { interviewRules, validate };
