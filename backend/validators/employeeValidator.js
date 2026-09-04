const { body } = require("express-validator");
const { validate } = require("./authValidator");

const employeeRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("A valid email is required"),
  body("password").notEmpty().withMessage("Password is required").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("employeeCode").trim().notEmpty().withMessage("Employee code is required"),
  body("department").isMongoId().withMessage("A valid department is required"),
  body("designation").isMongoId().withMessage("A valid designation is required"),
  body("joiningDate").isISO8601().toDate().withMessage("A valid joining date is required"),
  body("gender").notEmpty().withMessage("Gender is required").isIn(["male", "female", "other"]).withMessage("Invalid gender"),
  body("dateOfBirth").notEmpty().withMessage("Date of birth is required").isISO8601().withMessage("Invalid date of birth"),
  body("employmentType")
    .notEmpty()
    .withMessage("Employment type is required")
    .isIn(["full_time", "part_time", "contract", "intern"])
    .withMessage("Invalid employment type"),
  body("phone").trim().notEmpty().withMessage("Phone number is required"),
  body("salary").notEmpty().withMessage("Base salary is required").isNumeric().withMessage("Salary must be a number"),
  body("status").notEmpty().withMessage("Employee status is required").isIn(["active", "inactive", "on_leave", "probation", "terminated"]).withMessage("Invalid status"),
  body("manager").optional({ nullable: true, checkFalsy: true }).isMongoId().withMessage("Manager must be a valid employee"),
  body("shift").optional({ nullable: true, checkFalsy: true }).isMongoId().withMessage("Shift must be valid"),
  body("attendancePolicy").optional({ nullable: true, checkFalsy: true }).isMongoId().withMessage("Attendance policy must be valid"),
  // contact/banking are JSON-stringified in multipart requests — only a
  // structural parse check happens here; required-subfield checks happen
  // in the controller after JSON.parse, since express-validator can't
  // easily inspect fields inside a string.
  body("contact")
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      JSON.parse(value); // throws -> express-validator reports it as invalid
      return true;
    })
    .withMessage("Invalid contact data"),
  body("banking")
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      JSON.parse(value);
      return true;
    })
    .withMessage("Invalid banking data"),
];

const passwordRules = [
  body("newPassword").notEmpty().withMessage("Password is required").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

const documentRules = [body("documentType").isMongoId().withMessage("A valid document type is required")];

module.exports = { employeeRules, passwordRules, documentRules, validate };
