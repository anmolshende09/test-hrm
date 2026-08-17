const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { roleRules, validate } = require("../validators/roleValidator");
const { getPermissionCatalog, createRole, getRoles, getRole, updateRole, deleteRole } = require("../controllers/roleController");

router.get("/permission-catalog", protect, authorize("admin"), getPermissionCatalog);

router
  .route("/")
  .get(protect, authorize("admin"), getRoles)
  .post(protect, authorize("admin"), roleRules, validate, createRole);

router
  .route("/:id")
  .get(protect, authorize("admin"), getRole)
  .put(protect, authorize("admin"), roleRules, validate, updateRole)
  .delete(protect, authorize("admin"), deleteRole);

module.exports = router;
