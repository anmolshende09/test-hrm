const express = require("express");
const router = express.Router();
const {
  createPolicy,
  getPolicies,
  getPolicy,
  updatePolicy,
  deletePolicy,
} = require("../controllers/attendancePolicyController");
const { protect, authorize } = require("../middleware/auth");
const { attendancePolicyRules, validate } = require("../validators/attendancePolicyValidator");

router.use(protect);

router
  .route("/")
  .get(getPolicies)
  .post(authorize("admin", "hr_manager"), attendancePolicyRules, validate, createPolicy);

router
  .route("/:id")
  .get(getPolicy)
  .put(authorize("admin", "hr_manager"), attendancePolicyRules, validate, updatePolicy)
  .delete(authorize("admin"), deletePolicy);

module.exports = router;
