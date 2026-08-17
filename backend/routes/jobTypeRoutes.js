const express = require("express");
const router = express.Router();
const {
  createJobType,
  getJobTypes,
  getAllJobTypes,
  updateJobType,
  deleteJobType,
} = require("../controllers/jobTypeController");
const { protect, authorize } = require("../middleware/auth");
const { jobTypeRules, validate } = require("../validators/jobTypeValidator");

router.use(protect);

router.get("/all", getAllJobTypes);

router
  .route("/")
  .get(getJobTypes)
  .post(authorize("admin", "hr_manager"), jobTypeRules, validate, createJobType);

router
  .route("/:id")
  .put(authorize("admin", "hr_manager"), jobTypeRules, validate, updateJobType)
  .delete(authorize("admin"), deleteJobType);

module.exports = router;
