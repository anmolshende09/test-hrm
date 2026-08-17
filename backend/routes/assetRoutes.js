const express = require("express");
const router = express.Router();
const { createAsset, getAssets, getAsset, updateAsset, assignAsset, returnAsset, scheduleMaintenance, deleteAsset, exportAssets, getAssetDashboard, getDepreciationReport, exportDepreciation } = require("../controllers/assetController");
const { protect, authorize } = require("../middleware/auth");
const { assetRules, validate } = require("../validators/assetValidator");

router.use(protect);
router.use(authorize("admin", "hr_manager"));

// Specific routes before /:id
router.get("/dashboard", getAssetDashboard);
router.get("/depreciation", getDepreciationReport);
router.get("/depreciation/export", exportDepreciation);
router.get("/export", exportAssets);

router.route("/").get(getAssets).post(assetRules, validate, createAsset);
router.route("/:id").get(getAsset).put(assetRules, validate, updateAsset).delete(deleteAsset);
router.put("/:id/assign", assignAsset);
router.put("/:id/return", returnAsset);
router.post("/:id/maintenance", scheduleMaintenance);

module.exports = router;
