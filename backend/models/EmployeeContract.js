const mongoose = require("mongoose");

const employeeContractSchema = new mongoose.Schema(
  {
    contractNumber: {
      type: String,
      required: [true, "Contract number is required"],
      unique: true,
      trim: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Employee is required"],
    },
    contractType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ContractType",
      required: [true, "Contract type is required"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      default: null,
    },
    basicSalary: {
      type: Number,
      default: null,
      min: 0,
    },
    // "supports multiple entries" per §7.2.1
    allowances: [
      {
        name: { type: String, trim: true, required: true },
        amount: { type: Number, min: 0, required: true },
      },
    ],
    benefits: [{ type: String, trim: true }],
    termsAndConditions: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["draft", "active", "expired", "terminated"],
      default: "draft",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    // §7.2.2 Amendment Tracking — every modification (edits, renewals) is
    // logged here rather than diffed automatically, so the log stays
    // meaningful instead of noisy.
    amendments: [
      {
        description: { type: String, trim: true, required: true },
        amendedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        amendedAt: { type: Date, default: Date.now },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

employeeContractSchema.index({ contractNumber: "text", termsAndConditions: "text" });

// Computed at query time, same pattern as Resignation.noticePeriodDays —
// never stored so it can't go stale between saves.
employeeContractSchema.virtual("daysUntilExpiry").get(function () {
  if (!this.endDate) return null;
  const diffMs = this.endDate.getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
});

employeeContractSchema.virtual("isExpired").get(function () {
  return !!(this.endDate && this.endDate.getTime() < Date.now());
});

module.exports = mongoose.model("EmployeeContract", employeeContractSchema);