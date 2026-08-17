const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
    },
    designation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Designation",
      required: [true, "Designation is required"],
    },
    joiningDate: {
      type: Date,
      required: [true, "Joining date is required"],
    },
    salary: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "on_leave"],
      default: "active",
    },
    profilePicture: {
      type: String, // relative path e.g. /uploads/employees/xyz.jpg
      default: null,
    },
    // Self-reference for the Org Chart's manager -> subordinate hierarchy.
    // null = no manager set (renders as a top-level/root node in the chart).
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    // Optional — which work shift this employee is assigned to. Nullable and
    // additive, unlike the `designation` migration: no existing data assumes
    // a value here, so this is safe to add without a reseed.
    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
      default: null,
    },
  },
  { timestamps: true }
);

employeeSchema.index({ name: "text", email: "text", employeeId: "text" });

module.exports = mongoose.model("Employee", employeeSchema);
