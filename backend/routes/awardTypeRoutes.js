const express = require("express");
const router = express.Router();
const {
  createAwardType,
  getAwardTypes,
  updateAwardType,
  deleteAwardType,
} = require("../controllers/awardTypeController");
const { protect, authorize } = require("../middleware/auth");
const { awardTypeRules, validate } = require("../validators/awardTypeValidator");

router.use(protect);

router
  .route("/")
  .get(getAwardTypes)
  .post(authorize("admin", "hr_manager"), awardTypeRules, validate, createAwardType);

router
  .route("/:id")
  .put(authorize("admin", "hr_manager"), awardTypeRules, validate, updateAwardType)
  .delete(authorize("admin"), deleteAwardType);

module.exports = router;
