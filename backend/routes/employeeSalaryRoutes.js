const express = require("express");
const router = express.Router();
const { createEmployeeSalary, getEmployeeSalaries, getEmployeeSalary, updateEmployeeSalary, deleteEmployeeSalary } = require("../controllers/employeeSalaryController");
const { protect, authorize } = require("../middleware/auth");
const { employeeSalaryRules, validate } = require("../validators/employeeSalaryValidator");

router.use(protect);
router.use(authorize("admin", "hr_manager"));

router.route("/").get(getEmployeeSalaries).post(employeeSalaryRules, validate, createEmployeeSalary);
router.route("/:id").get(getEmployeeSalary).put(employeeSalaryRules, validate, updateEmployeeSalary).delete(deleteEmployeeSalary);

module.exports = router;
