const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const uploadMediaFiles = require("../config/mediaUpload");
const { mediaFileUpdateRules, validate } = require("../validators/mediaFileValidator");
const {
  uploadMediaFiles: uploadMediaFilesHandler,
  getMediaFiles,
  getMediaStats,
  updateMediaFile,
  deleteMediaFile,
} = require("../controllers/mediaFileController");

router.get("/stats", protect, getMediaStats);

router
  .route("/")
  .get(protect, getMediaFiles)
  .post(protect, authorize("admin", "hr_manager"), uploadMediaFiles.array("files", 20), uploadMediaFilesHandler);

router
  .route("/:id")
  .put(protect, authorize("admin", "hr_manager"), mediaFileUpdateRules, validate, updateMediaFile)
  .delete(protect, authorize("admin", "hr_manager"), deleteMediaFile);

module.exports = router;