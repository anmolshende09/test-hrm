const mongoose = require("mongoose");

const payslipSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    payrollRun: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PayrollRun",
      required: true,
    },
    payDate: { type: Date, required: true },
    basicSalary: { type: Number, required: true },
    grossPay: { type: Number, required: true },
    totalDeductions: { type: Number, default: 0 },
    netPay: { type: Number, required: true },
    // Snapshot of components at time of generation
    breakdown: [
      {
        name: String,
        type: { type: String, enum: ["earning", "deduction"] },
        amount: Number,
      },
    ],
    status: {
      type: String,
      enum: ["generated", "sent"],
      default: "generated",
    },
  },
  { timestamps: true }
);

payslipSchema.index({ employee: 1, payrollRun: 1 }, { unique: true });

module.exports = mongoose.model("Payslip", payslipSchema);
