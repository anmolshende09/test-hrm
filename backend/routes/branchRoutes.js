const express = require("express");
const router = express.Router();
const {
  createBranch,
  getBranches,
  getBranch,
  getAllBranches,
  updateBranch,
  deleteBranch,
} = require("../controllers/branchController");
const { protect, authorize } = require("../middleware/auth");
const { branchRules, validate } = require("../validators/branchValidator");

router.use(protect);

// Must come before /:id — otherwise Express matches "all" as an :id param.
router.get("/all", getAllBranches);

router
  .route("/")
  .get(getBranches)
  .post(authorize("admin", "hr_manager"), branchRules, validate, createBranch);

router
  .route("/:id")
  .get(getBranch)
  .put(authorize("admin", "hr_manager"), branchRules, validate, updateBranch)
  .delete(authorize("admin"), deleteBranch);

module.exports = router;
