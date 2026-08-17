const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { trainingProgramRules, validate } = require("../validators/trainingProgramValidator");
const {
  createTrainingProgram,
  getTrainingPrograms,
  getTrainingProgramsAll,
  getTrainingProgramStatusCounts,
  getTrainingProgram,
  updateTrainingProgram,
  deleteTrainingProgram,
} = require("../controllers/trainingProgramController");

router.get("/all", protect, getTrainingProgramsAll);
router.get("/status-counts", protect, getTrainingProgramStatusCounts);

router
  .route("/")
  .get(protect, getTrainingPrograms)
  .post(protect, authorize("admin", "hr_manager"), trainingProgramRules, validate, createTrainingProgram);

router
  .route("/:id")
  .get(protect, getTrainingProgram)
  .put(protect, authorize("admin", "hr_manager"), trainingProgramRules, validate, updateTrainingProgram)
  .delete(protect, authorize("admin", "hr_manager"), deleteTrainingProgram);

module.exports = router;
