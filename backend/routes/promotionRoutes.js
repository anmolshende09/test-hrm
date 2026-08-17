const express = require("express");
const router = express.Router();
const { createPromotion, getPromotions, updatePromotion, deletePromotion } = require("../controllers/promotionController");
const { protect, authorize } = require("../middleware/auth");
const { promotionRules, validate } = require("../validators/promotionValidator");
const upload = require("../config/lifecycleDocumentUpload");

router.use(protect);
router.use(authorize("admin", "hr_manager"));

router.route("/")
  .get(getPromotions)
  .post(upload.array("documents", 5), promotionRules, validate, createPromotion);

router.route("/:id")
  .put(upload.array("documents", 5), promotionRules, validate, updatePromotion)
  .delete(deletePromotion);

module.exports = router;
