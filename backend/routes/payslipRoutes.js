const express = require("express");
const router = express.Router();
const { getPayslips, getPayslip } = require("../controllers/payslipController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.use(authorize("admin", "hr_manager"));

router.get("/", getPayslips);
router.get("/:id", getPayslip);

module.exports = router;
