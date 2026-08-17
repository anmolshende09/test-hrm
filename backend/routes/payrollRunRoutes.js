const express = require("express");
const router = express.Router();
const { createPayrollRun, getPayrollRuns, updatePayrollRun, deletePayrollRun, exportPayrollRun } = require("../controllers/payrollRunController");
const { protect, authorize } = require("../middleware/auth");
const { payrollRunRules, validate } = require("../validators/payrollRunValidator");

router.use(protect);
router.use(authorize("admin", "hr_manager"));

// Export before /:id so Express doesn't match "export" as an id
router.get("/:id/export", exportPayrollRun);

router.route("/").get(getPayrollRuns).post(payrollRunRules, validate, createPayrollRun);
router.route("/:id").put(payrollRunRules, validate, updatePayrollRun).delete(deletePayrollRun);

module.exports = router;
