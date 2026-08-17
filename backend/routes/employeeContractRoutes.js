const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  employeeContractRules,
  renewRules,
  amendmentRules,
  validate,
} = require("../validators/employeeContractValidator");
const {
  createEmployeeContract,
  getEmployeeContracts,
  getEmployeeContract,
  updateEmployeeContract,
  approveEmployeeContract,
  renewEmployeeContract,
  addAmendment,
  deleteEmployeeContract,
} = require("../controllers/employeeContractController");

router
  .route("/")
  .get(protect, getEmployeeContracts)
  .post(protect, authorize("admin", "hr_manager"), employeeContractRules, validate, createEmployeeContract);

router
  .route("/:id")
  .get(protect, getEmployeeContract)
  .put(protect, authorize("admin", "hr_manager"), employeeContractRules, validate, updateEmployeeContract)
  .delete(protect, authorize("admin", "hr_manager"), deleteEmployeeContract);

router.put("/:id/approve", protect, authorize("admin", "hr_manager"), approveEmployeeContract);
router.put("/:id/renew", protect, authorize("admin", "hr_manager"), renewRules, validate, renewEmployeeContract);
router.post("/:id/amendments", protect, authorize("admin", "hr_manager"), amendmentRules, validate, addAmendment);

module.exports = router;