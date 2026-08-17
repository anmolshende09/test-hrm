const mongoose = require("mongoose");

const payrollRunSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Payroll run title is required"],
      trim: true,
    },
    frequency: {
      type: String,
      enum: ["monthly", "bi_weekly", "weekly"],
      default: "monthly",
    },
    periodStart: {
      type: Date,
      required: [true, "Period start date is required"],
    },
    periodEnd: {
      type: Date,
      required: [true, "Period end date is required"],
    },
    payDate: {
      type: Date,
      required: [true, "Pay date is required"],
    },
    status: {
      type: String,
      enum: ["draft", "processing", "completed", "cancelled"],
      default: "draft",
    },
    // Aggregates computed when the run is processed
    totalEmployees: { type: Number, default: 0 },
    grossPay: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
    netPay: { type: Number, default: 0 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PayrollRun", payrollRunSchema);
