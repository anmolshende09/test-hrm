const express = require("express");
const router = express.Router();
const {
  getCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} = require("../controllers/calendarController");
const { protect, authorize } = require("../middleware/auth");
const { calendarEventRules, validate } = require("../validators/calendarValidator");

router.use(protect);

router
  .route("/")
  .get(getCalendarEvents)
  .post(authorize("admin", "hr_manager"), calendarEventRules, validate, createCalendarEvent);

router
  .route("/:id")
  .put(authorize("admin", "hr_manager"), calendarEventRules, validate, updateCalendarEvent)
  .delete(authorize("admin", "hr_manager"), deleteCalendarEvent);

module.exports = router;
