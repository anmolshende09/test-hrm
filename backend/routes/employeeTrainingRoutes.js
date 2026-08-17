const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const uploadCertificate = require("../config/trainingCertificateUpload");
const { employeeTrainingRules, bulkAssignRules, validate } = require("../validators/employeeTrainingValidator");
const {
  createEmployeeTraining,
  bulkAssignEmployeeTraining,
  getEmployeeTrainings,
  getEmployeeTrainingStatusCounts,
  getEmployeeTraining,
  updateEmployeeTraining,
  deleteEmployeeTraining,
} = require("../controllers/employeeTrainingController");

router.get("/status-counts", protect, getEmployeeTrainingStatusCounts);

router.post(
  "/bulk-assign",
  protect,
  authorize("admin", "hr_manager"),
  bulkAssignRules,
  validate,
  bulkAssignEmployeeTraining
);

router
  .route("/")
  .get(protect, getEmployeeTrainings)
  .post(
    protect,
    authorize("admin", "hr_manager"),
    uploadCertificate.single("certificate"),
    employeeTrainingRules,
    validate,
    createEmployeeTraining
  );

router
  .route("/:id")
  .get(protect, getEmployeeTraining)
  .put(
    protect,
    authorize("admin", "hr_manager"),
    uploadCertificate.single("certificate"),
    employeeTrainingRules,
    validate,
    updateEmployeeTraining
  )
  .delete(protect, authorize("admin", "hr_manager"), deleteEmployeeTraining);

module.exports = router;
