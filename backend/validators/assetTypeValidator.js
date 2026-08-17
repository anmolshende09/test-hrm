const { body } = require("express-validator");
const { validate } = require("./authValidator");
const assetTypeRules = [
  body("name").trim().notEmpty().withMessage("Asset type name is required"),
  body("description").optional().trim(),
];
module.exports = { assetTypeRules, validate };
