const express = require("express");
const router = express.Router();
const { createWarning, getWarnings, updateWarning,deleteWarning, } = require("../controllers/warningController");
const { protect, authorize } = require("../middleware/auth");
const { warningRules, validate } = require("../validators/warningValidator");
const upload = require("../config/lifecycleDocumentUpload");

router.use(protect);
router.use(authorize("admin", "hr_manager"));

router.route("/")
  .get(getWarnings)
  .post(upload.array("documents", 5), warningRules, validate, createWarning);

// No DELETE route — warnings are audit records
router.route("/:id")
  .put(upload.array("documents", 5), warningRules, validate, updateWarning)
  .delete(deleteWarning);

module.exports = router;
