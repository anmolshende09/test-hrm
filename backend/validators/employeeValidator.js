const { body } = require("express-validator");
const { validate } = require("./authValidator");

const employeeRules = [
  body("employeeId").trim().notEmpty().withMessage("Employee ID is required"),
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("A valid email is required"),
  body("department").isMongoId().withMessage("A valid department is required"),
  body("designation").isMongoId().withMessage("A valid designation is required"),
  body("joiningDate").isISO8601().toDate().withMessage("A valid joining date is required"),
  body("phone").optional().trim(),
  body("salary").optional().isNumeric().withMessage("Salary must be a number"),
  body("status").optional().isIn(["active", "inactive", "on_leave"]).withMessage("Invalid status"),
  body("manager")
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage("Manager must be a valid employee"),
];

module.exports = { employeeRules, validate };
