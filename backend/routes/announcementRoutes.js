const express = require("express");
const router = express.Router();
const {
  createAnnouncement,
  getAnnouncements,
  getAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require("../controllers/announcementController");
const { protect, authorize } = require("../middleware/auth");
const { announcementRules, validate } = require("../validators/announcementValidator");
const uploadAnnouncementAttachment = require("../config/announcementUpload");

router.use(protect);

router
  .route("/")
  .get(getAnnouncements)
  .post(
    authorize("admin", "hr_manager"),
    uploadAnnouncementAttachment.single("attachment"),
    announcementRules,
    validate,
    createAnnouncement
  );

router
  .route("/:id")
  .get(getAnnouncement)
  .put(
    authorize("admin", "hr_manager"),
    uploadAnnouncementAttachment.single("attachment"),
    announcementRules,
    validate,
    updateAnnouncement
  )
  .delete(authorize("admin", "hr_manager"), deleteAnnouncement);

module.exports = router;
