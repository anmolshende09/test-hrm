const express = require("express");
const router = express.Router();
const {
  createEmployee,
  getEmployees,
  getOrgChart,
  getEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");
const { protect, authorize } = require("../middleware/auth");
const { employeeRules, validate } = require("../validators/employeeValidator");
const upload = require("../config/upload");

router.use(protect);

router
  .route("/")
  .get(getEmployees)
  .post(authorize("admin", "hr_manager"), upload.single("profilePicture"), employeeRules, validate, createEmployee);

// Must come before /:id — otherwise Express matches "org-chart" as an :id param.
router.get("/org-chart", getOrgChart);

router
  .route("/:id")
  .get(getEmployee)
  .put(authorize("admin", "hr_manager"), upload.single("profilePicture"), updateEmployee)
  .delete(authorize("admin"), deleteEmployee);

module.exports = router;
