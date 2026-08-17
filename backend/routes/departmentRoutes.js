const express = require("express");
const router = express.Router();
const {
  createDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/departmentController");
const { protect, authorize } = require("../middleware/auth");
const { departmentRules, validate } = require("../validators/departmentValidator");

router.use(protect);

router
  .route("/")
  .get(getDepartments)
  .post(authorize("admin", "hr_manager"), departmentRules, validate, createDepartment);

router
  .route("/:id")
  .get(getDepartment)
  .put(authorize("admin", "hr_manager"), departmentRules, validate, updateDepartment)
  .delete(authorize("admin"), deleteDepartment);

module.exports = router;
