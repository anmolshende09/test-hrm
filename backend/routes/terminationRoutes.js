const express = require("express");
const router = express.Router();
const { createTermination, getTerminations, updateTermination, deleteTermination } = require("../controllers/terminationController");
const { protect, authorize } = require("../middleware/auth");
const { terminationRules, validate } = require("../validators/terminationValidator");
const upload = require("../config/lifecycleDocumentUpload");

router.use(protect);
router.use(authorize("admin", "hr_manager"));

router.route("/")
  .get(getTerminations)
  .post(upload.array("documents", 5), terminationRules, validate, createTermination);

router.route("/:id")
  .put(upload.array("documents", 5), terminationRules, validate, updateTermination)
  .delete(deleteTermination);

module.exports = router;
