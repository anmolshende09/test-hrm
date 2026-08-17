const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { documentCategoryRules, validate } = require("../validators/documentCategoryValidator");
const {
  createDocumentCategory,
  getDocumentCategories,
  getDocumentCategoriesAll,
  updateDocumentCategory,
  deleteDocumentCategory,
} = require("../controllers/documentCategoryController");

router.get("/all", protect, getDocumentCategoriesAll);

router
  .route("/")
  .get(protect, getDocumentCategories)
  .post(protect, authorize("admin", "hr_manager"), documentCategoryRules, validate, createDocumentCategory);

router
  .route("/:id")
  .put(protect, authorize("admin", "hr_manager"), documentCategoryRules, validate, updateDocumentCategory)
  .delete(protect, authorize("admin", "hr_manager"), deleteDocumentCategory);

module.exports = router;