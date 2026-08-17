const express = require("express");
const router = express.Router();
const {
  markAttendance,
  getHistory,
  getToday,
  getPercentage,
  getMatrix,
  getSummary,
  exportAttendance,
  importAttendance,
} = require("../controllers/attendanceController");
const { protect, authorize } = require("../middleware/auth");
const { body } = require("express-validator");
const { validate } = require("../validators/authValidator");
const uploadCSV = require("../config/csvUpload");

router.use(protect);

const markRules = [
  body("employee").isMongoId().withMessage("A valid employee is required"),
  body("status")
    .isIn(["present", "absent", "half_day", "on_leave", "day_off"])
    .withMessage("Invalid attendance status"),
];

router.post("/", authorize("admin", "hr_manager", "employee"), markRules, validate, markAttendance);
router.get("/today", authorize("admin", "hr_manager"), getToday);
router.get("/matrix", authorize("admin", "hr_manager"), getMatrix);
router.get("/summary", authorize("admin", "hr_manager"), getSummary);
router.get("/export", authorize("admin", "hr_manager"), exportAttendance);
router.post("/import", authorize("admin", "hr_manager"), uploadCSV.single("file"), importAttendance);
router.get("/history/:employeeId", getHistory);
router.get("/percentage/:employeeId", getPercentage);

module.exports = router;
