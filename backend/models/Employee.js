const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // §6.3 — used to map the employee to a biometric device. Separate from
    // employeeId (which is auto-generated) — this one is admin-entered.
    employeeCode: {
      type: String,
      required: [true, "Employee code is required"],
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
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", null],
      default: null,
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
    employmentType: {
      type: String,
      enum: ["full_time", "part_time", "contract", "intern"],
      default: "full_time",
    },
    salary: {
      type: Number,
      default: null,
    },
    // Extended additively — "on_leave" is kept even though it's not in the
    // new spec's 4-tab list, so existing records already using it don't
    // break on next save. New values: probation, terminated.
    status: {
      type: String,
      enum: ["active", "inactive", "on_leave", "probation", "terminated"],
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
    // Optional, same additive reasoning as `shift`.
    attendancePolicy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AttendancePolicy",
      default: null,
    },
    // §8/§9 — grouped as sub-documents rather than flat top-level fields,
    // since they're always read/written together as a unit (the Contact tab).
    contact: {
      addressLine1: { type: String, trim: true, default: "" },
      addressLine2: { type: String, trim: true, default: "" },
      city: { type: String, trim: true, default: "" },
      state: { type: String, trim: true, default: "" },
      country: { type: String, trim: true, default: "" },
      postalCode: { type: String, trim: true, default: "" },
      emergencyContact: {
        name: { type: String, trim: true, default: "" },
        relationship: { type: String, trim: true, default: "" },
        phone: { type: String, trim: true, default: "" },
      },
    },
    // §10 — Base Salary is deliberately NOT duplicated here; it reuses the
    // existing top-level `salary` field above (same value, same meaning).
    banking: {
      bankName: { type: String, trim: true, default: "" },
      accountHolderName: { type: String, trim: true, default: "" },
      accountNumber: { type: String, trim: true, default: "" },
      bic: { type: String, trim: true, default: "" }, // BIC/SWIFT
      bankBranch: { type: String, trim: true, default: "" },
      taxPayerId: { type: String, trim: true, default: "" },
    },
  },
  { timestamps: true }
);

employeeSchema.index({ name: "text", email: "text", employeeId: "text" });

module.exports = mongoose.model("Employee", employeeSchema);
