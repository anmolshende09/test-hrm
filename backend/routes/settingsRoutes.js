const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const uploadBrandAssets = require("../config/brandUpload");
const {
  systemSettingsRules,
  emailSettingsRules,
  testEmailRules,
  workingDaysRules,
  validate,
} = require("../validators/settingsValidator");
const {
  getSettings,
  updateSystemSettings,
  updateBrandSettings,
  removeBrandAsset,
  updateEmailSettings,
  sendTestEmail,
  updateWorkingDaysSettings,
  updateStorageSettings,
} = require("../controllers/settingsController");

router.get("/", protect, getSettings);

router.put("/system", protect, authorize("admin"), systemSettingsRules, validate, updateSystemSettings);

router.put(
  "/brand",
  protect,
  authorize("admin"),
  uploadBrandAssets.fields([
    { name: "logoDark", maxCount: 1 },
    { name: "logoLight", maxCount: 1 },
    { name: "favicon", maxCount: 1 },
  ]),
  updateBrandSettings
);
router.delete("/brand/:field", protect, authorize("admin"), removeBrandAsset);

router.put("/email", protect, authorize("admin"), emailSettingsRules, validate, updateEmailSettings);
router.post("/email/test", protect, authorize("admin"), testEmailRules, validate, sendTestEmail);

router.put("/working-days", protect, authorize("admin"), workingDaysRules, validate, updateWorkingDaysSettings);

router.put("/storage", protect, authorize("admin"), updateStorageSettings);

module.exports = router;
