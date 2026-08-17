const express = require("express");
const router = express.Router();
const {
  createDocumentType,
  getDocumentTypes,
  updateDocumentType,
  deleteDocumentType,
} = require("../controllers/documentTypeController");
const { protect, authorize } = require("../middleware/auth");
const { documentTypeRules, validate } = require("../validators/documentTypeValidator");

router.use(protect);

router
  .route("/")
  .get(getDocumentTypes)
  .post(authorize("admin", "hr_manager"), documentTypeRules, validate, createDocumentType);

router
  .route("/:id")
  .put(authorize("admin", "hr_manager"), documentTypeRules, validate, updateDocumentType)
  .delete(authorize("admin"), deleteDocumentType);

module.exports = router;
