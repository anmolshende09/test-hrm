const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { mediaFolderRules, validate } = require("../validators/mediaFolderValidator");
const {
  createMediaFolder,
  getMediaFolders,
  updateMediaFolder,
  deleteMediaFolder,
} = require("../controllers/mediaFolderController");

router
  .route("/")
  .get(protect, getMediaFolders)
  .post(protect, authorize("admin", "hr_manager"), mediaFolderRules, validate, createMediaFolder);

router
  .route("/:id")
  .put(protect, authorize("admin", "hr_manager"), mediaFolderRules, validate, updateMediaFolder)
  .delete(protect, authorize("admin", "hr_manager"), deleteMediaFolder);

module.exports = router;