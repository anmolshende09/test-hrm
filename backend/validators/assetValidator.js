const { body } = require("express-validator");
const { validate } = require("./authValidator");
const assetRules = [
  body("name").trim().notEmpty().withMessage("Asset name is required"),
  body("assetCode").trim().notEmpty().withMessage("Asset code is required"),
  body("assetType").isMongoId().withMessage("A valid asset type is required"),
  body("purchaseCost").optional().isFloat({ min: 0 }).withMessage("Purchase cost must be non-negative"),
  body("usefulLifeYears").optional().isFloat({ min: 0 }).withMessage("Useful life must be non-negative"),
  body("salvageValue").optional().isFloat({ min: 0 }).withMessage("Salvage value must be non-negative"),
  body("status").optional().isIn(["available", "assigned", "under_maintenance", "retired"]).withMessage("Invalid status"),
  body("depreciationMethod").optional().isIn(["straight_line", "none"]).withMessage("Invalid depreciation method"),
];
module.exports = { assetRules, validate };
