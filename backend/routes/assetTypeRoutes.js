const express = require("express");
const router = express.Router();
const { createAssetType, getAssetTypes, updateAssetType, deleteAssetType } = require("../controllers/assetTypeController");
const { protect, authorize } = require("../middleware/auth");
const { assetTypeRules, validate } = require("../validators/assetTypeValidator");
router.use(protect);
router.route("/").get(getAssetTypes).post(authorize("admin", "hr_manager"), assetTypeRules, validate, createAssetType);
router.route("/:id").put(authorize("admin", "hr_manager"), assetTypeRules, validate, updateAssetType).delete(authorize("admin"), deleteAssetType);
module.exports = router;
