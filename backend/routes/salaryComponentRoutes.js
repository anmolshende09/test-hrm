const express = require("express");
const router = express.Router();
const { createSalaryComponent, getSalaryComponents, getAllSalaryComponents, updateSalaryComponent, deleteSalaryComponent } = require("../controllers/salaryComponentController");
const { protect, authorize } = require("../middleware/auth");
const { salaryComponentRules, validate } = require("../validators/salaryComponentValidator");

router.use(protect);
router.use(authorize("admin", "hr_manager"));

router.get("/all", getAllSalaryComponents);
router.route("/").get(getSalaryComponents).post(salaryComponentRules, validate, createSalaryComponent);
router.route("/:id").put(salaryComponentRules, validate, updateSalaryComponent).delete(deleteSalaryComponent);

module.exports = router;
