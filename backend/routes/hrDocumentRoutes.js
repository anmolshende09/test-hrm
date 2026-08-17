const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const uploadHRDocument = require("../config/hrDocumentUpload");
const { hrDocumentRules, validate } = require("../validators/hrDocumentValidator");
const {
  createHRDocument,
  getHRDocuments,
  getHRDocument,
  updateHRDocument,
  approveHRDocument,
  trackDownload,
  deleteHRDocument,
} = require("../controllers/hrDocumentController");

router
  .route("/")
  .get(protect, getHRDocuments)
  .post(
    protect,
    authorize("admin", "hr_manager"),
    uploadHRDocument.single("file"),
    hrDocumentRules,
    validate,
    createHRDocument
  );

router
  .route("/:id")
  .get(protect, getHRDocument)
  .put(
    protect,
    authorize("admin", "hr_manager"),
    uploadHRDocument.single("file"),
    hrDocumentRules,
    validate,
    updateHRDocument
  )
  .delete(protect, authorize("admin", "hr_manager"), deleteHRDocument);

router.put("/:id/approve", protect, authorize("admin", "hr_manager"), approveHRDocument);
router.patch("/:id/download", protect, trackDownload);

module.exports = router;