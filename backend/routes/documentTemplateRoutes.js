const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { documentTemplateRules, validate } = require("../validators/documentTemplateValidator");
const {
  createDocumentTemplate,
  getDocumentTemplates,
  getDocumentTemplate,
  updateDocumentTemplate,
  generateDocument,
  deleteDocumentTemplate,
} = require("../controllers/documentTemplateController");

router
  .route("/")
  .get(protect, getDocumentTemplates)
  .post(protect, authorize("admin", "hr_manager"), documentTemplateRules, validate, createDocumentTemplate);

router
  .route("/:id")
  .get(protect, getDocumentTemplate)
  .put(protect, authorize("admin", "hr_manager"), documentTemplateRules, validate, updateDocumentTemplate)
  .delete(protect, authorize("admin", "hr_manager"), deleteDocumentTemplate);

router.post("/:id/generate", protect, authorize("admin", "hr_manager"), generateDocument);

module.exports = router;