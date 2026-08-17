const express = require("express");
const router = express.Router();
const {
  createShift,
  getShifts,
  getAllShifts,
  getShift,
  updateShift,
  deleteShift,
} = require("../controllers/shiftController");
const { protect, authorize } = require("../middleware/auth");
const { shiftRules, validate } = require("../validators/shiftValidator");

router.use(protect);

// Must come before /:id — otherwise Express matches "all" as an :id param.
router.get("/all", getAllShifts);

router
  .route("/")
  .get(getShifts)
  .post(authorize("admin", "hr_manager"), shiftRules, validate, createShift);

router
  .route("/:id")
  .get(getShift)
  .put(authorize("admin", "hr_manager"), shiftRules, validate, updateShift)
  .delete(authorize("admin"), deleteShift);

module.exports = router;
