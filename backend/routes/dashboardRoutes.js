const express = require("express");
const router = express.Router();
const { getDashboard, getHiringTrend, getPayrollTrend } = require("../controllers/dashboardController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getDashboard);
router.get("/hiring-trend", protect, getHiringTrend);
router.get("/payroll-trend", protect, getPayrollTrend);

module.exports = router;
