const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { createUserRules, updateUserRules, passwordRules, statusRules, validate } = require("../validators/userValidator");
const {
  createUser,
  getUsers,
  getUser,
  updateUser,
  updateUserPassword,
  updateUserStatus,
  deleteUser,
} = require("../controllers/userController");

// Deliberately admin-only across the board — stricter than the usual
// authorize("admin", "hr_manager") pattern used elsewhere in this project,
// since this module controls credentials, roles, and account deletion.
router
  .route("/")
  .get(protect, authorize("admin"), getUsers)
  .post(protect, authorize("admin"), createUserRules, validate, createUser);

router
  .route("/:id")
  .get(protect, authorize("admin"), getUser)
  .put(protect, authorize("admin"), updateUserRules, validate, updateUser)
  .delete(protect, authorize("admin"), deleteUser);

router.put("/:id/password", protect, authorize("admin"), passwordRules, validate, updateUserPassword);
router.put("/:id/status", protect, authorize("admin"), statusRules, validate, updateUserStatus);

module.exports = router;
