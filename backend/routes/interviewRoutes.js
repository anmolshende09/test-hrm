const express = require("express");
const router = express.Router();
const {
  createInterview,
  getInterviews,
  updateInterview,
  deleteInterview,
} = require("../controllers/interviewController");
const { protect, authorize } = require("../middleware/auth");
const { interviewRules, validate } = require("../validators/interviewValidator");

router.use(protect);
router.use(authorize("admin", "hr_manager"));

router.route("/").get(getInterviews).post(interviewRules, validate, createInterview);

router.route("/:id").put(interviewRules, validate, updateInterview).delete(deleteInterview);

module.exports = router;
