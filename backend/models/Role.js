const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Role name is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    // Array of permission catalog keys, e.g. "users.perm_0" — validated
    // against the live catalog in the controller, never trusted blindly.
    permissions: [{ type: String }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

roleSchema.index({ name: "text" });

module.exports = mongoose.model("Role", roleSchema);
