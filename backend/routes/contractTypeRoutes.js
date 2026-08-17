const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { contractTypeRules, validate } = require("../validators/contractTypeValidator");
const {
  createContractType,
  getContractTypes,
  getContractTypesAll,
  updateContractType,
  deleteContractType,
} = require("../controllers/contractTypeController");

router.get("/all", protect, getContractTypesAll);

router
  .route("/")
  .get(protect, getContractTypes)
  .post(protect, authorize("admin", "hr_manager"), contractTypeRules, validate, createContractType);

router
  .route("/:id")
  .put(protect, authorize("admin", "hr_manager"), contractTypeRules, validate, updateContractType)
  .delete(protect, authorize("admin", "hr_manager"), deleteContractType);

module.exports = router;