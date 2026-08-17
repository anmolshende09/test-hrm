const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { trainingTypeRules, validate } = require("../validators/trainingTypeValidator");
const {
  createTrainingType,
  getTrainingTypes,
  getTrainingTypesAll,
  getTrainingType,
  updateTrainingType,
  deleteTrainingType,
} = require("../controllers/trainingTypeController");

router.get("/all", protect, getTrainingTypesAll);

router
  .route("/")
  .get(protect, getTrainingTypes)
  .post(protect, authorize("admin", "hr_manager"), trainingTypeRules, validate, createTrainingType);

router
  .route("/:id")
  .get(protect, getTrainingType)
  .put(protect, authorize("admin", "hr_manager"), trainingTypeRules, validate, updateTrainingType)
  .delete(protect, authorize("admin", "hr_manager"), deleteTrainingType);

module.exports = router;
