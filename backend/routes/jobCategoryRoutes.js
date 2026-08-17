const express = require("express");
const router = express.Router();
const {
  createJobCategory,
  getJobCategories,
  getAllJobCategories,
  updateJobCategory,
  deleteJobCategory,
} = require("../controllers/jobCategoryController");
const { protect, authorize } = require("../middleware/auth");
const { jobCategoryRules, validate } = require("../validators/jobCategoryValidator");

router.use(protect);

router.get("/all", getAllJobCategories);

router
  .route("/")
  .get(getJobCategories)
  .post(authorize("admin", "hr_manager"), jobCategoryRules, validate, createJobCategory);

router
  .route("/:id")
  .put(authorize("admin", "hr_manager"), jobCategoryRules, validate, updateJobCategory)
  .delete(authorize("admin"), deleteJobCategory);

module.exports = router;
