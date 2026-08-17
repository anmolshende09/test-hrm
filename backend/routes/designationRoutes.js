const express = require("express");
const router = express.Router();
const {
  createDesignation,
  getDesignations,
  getAllDesignations,
  getDesignation,
  updateDesignation,
  deleteDesignation,
} = require("../controllers/designationController");
const { protect, authorize } = require("../middleware/auth");
const { designationRules, validate } = require("../validators/designationValidator");

router.use(protect);

// Must come before /:id — otherwise Express matches "all" as an :id param.
router.get("/all", getAllDesignations);

router
  .route("/")
  .get(getDesignations)
  .post(authorize("admin", "hr_manager"), designationRules, validate, createDesignation);

router
  .route("/:id")
  .get(getDesignation)
  .put(authorize("admin", "hr_manager"), designationRules, validate, updateDesignation)
  .delete(authorize("admin"), deleteDesignation);

module.exports = router;
