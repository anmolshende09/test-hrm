const express = require("express");
const router = express.Router();
const { applyLeave, getLeaves, getLeave, reviewLeave } = require("../controllers/leaveController");
const { protect, authorize } = require("../middleware/auth");
const { applyLeaveRules, reviewLeaveRules, validate } = require("../validators/leaveValidator");

router.use(protect);

router.route("/").get(getLeaves).post(applyLeaveRules, validate, applyLeave);
router.get("/:id", getLeave);
router.put("/:id/review", authorize("admin", "hr_manager"), reviewLeaveRules, validate, reviewLeave);

module.exports = router;
