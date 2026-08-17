const { body } = require("express-validator");
const { validate } = require("./authValidator");

const candidateRules = [
  body("name").trim().notEmpty().withMessage("Candidate name is required"),
  body("email").isEmail().withMessage("A valid email is required"),
  body("job").trim().notEmpty().withMessage("Job applied for is required"),
  body("source")
    .optional()
    .isIn(["referral", "linkedin", "job_board", "company_website", "walk_in", "other"])
    .withMessage("Invalid source"),
  body("experience").optional().isFloat({ min: 0 }).withMessage("Experience must be a non-negative number"),
  body("expectedSalary").optional().isFloat({ min: 0 }).withMessage("Expected salary must be a non-negative number"),
  body("status")
    .optional()
    .isIn(["applied", "screening", "interview", "offer", "hired", "rejected"])
    .withMessage("Invalid status"),
];

module.exports = { candidateRules, validate };
