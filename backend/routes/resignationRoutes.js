const express = require("express");
const router = express.Router();
const { createResignation, getResignations, updateResignation, deleteResignation } = require("../controllers/resignationController");
const { protect, authorize } = require("../middleware/auth");
const { resignationRules, validate } = require("../validators/resignationValidator");
const upload = require("../config/lifecycleDocumentUpload");

router.use(protect);
router.use(authorize("admin", "hr_manager"));

router.route("/")
  .get(getResignations)
  .post(upload.array("documents", 5), resignationRules, validate, createResignation);

router.route("/:id")
  .put(upload.array("documents", 5), resignationRules, validate, updateResignation)
  .delete(deleteResignation);

module.exports = router;
