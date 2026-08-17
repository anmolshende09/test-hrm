const mongoose = require("mongoose");

const designationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Designation name is required"],
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

// A designation name should be unique within its department, not globally
// (e.g. "Manager" can exist in both Engineering and Sales).
designationSchema.index({ name: 1, department: 1 }, { unique: true });
designationSchema.index({ name: "text" });

module.exports = mongoose.model("Designation", designationSchema);
