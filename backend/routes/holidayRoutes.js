const express = require("express");
const router = express.Router();
const {
  createHoliday,
  getHolidays,
  getHoliday,
  updateHoliday,
  deleteHoliday,
  exportHolidaysPDF,
  exportHolidaysICal,
} = require("../controllers/holidayController");
const { protect, authorize } = require("../middleware/auth");
const { holidayRules, validate } = require("../validators/holidayValidator");

router.use(protect);

// Must come before /:id — otherwise Express matches "export" as an :id param.
router.get("/export/pdf", exportHolidaysPDF);
router.get("/export/ical", exportHolidaysICal);

router
  .route("/")
  .get(getHolidays)
  .post(authorize("admin", "hr_manager"), holidayRules, validate, createHoliday);

router
  .route("/:id")
  .get(getHoliday)
  .put(authorize("admin", "hr_manager"), holidayRules, validate, updateHoliday)
  .delete(authorize("admin", "hr_manager"), deleteHoliday);

module.exports = router;
