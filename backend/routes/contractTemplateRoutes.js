const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { contractTemplateRules, generateContractRules, validate } = require("../validators/contractTemplateValidator");
const {
  createContractTemplate,
  getContractTemplates,
  getContractTemplate,
  updateContractTemplate,
  generateContract,
  deleteContractTemplate,
} = require("../controllers/contractTemplateController");

router
  .route("/")
  .get(protect, getContractTemplates)
  .post(protect, authorize("admin", "hr_manager"), contractTemplateRules, validate, createContractTemplate);

router
  .route("/:id")
  .get(protect, getContractTemplate)
  .put(protect, authorize("admin", "hr_manager"), contractTemplateRules, validate, updateContractTemplate)
  .delete(protect, authorize("admin", "hr_manager"), deleteContractTemplate);

router.post(
  "/:id/generate",
  protect,
  authorize("admin", "hr_manager"),
  generateContractRules,
  validate,
  generateContract
);

module.exports = router;