const mongoose = require("mongoose");

const employeeSalarySchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      unique: true, // one active salary record per employee
    },
    basicSalary: {
      type: Number,
      required: [true, "Basic salary is required"],
      min: 0,
    },
    // Applied components override the master SalaryComponent values for this
    // employee specifically — e.g. a fixed HRA different from the default.
    components: [
      {
        component: { type: mongoose.Schema.Types.ObjectId, ref: "SalaryComponent" },
        overrideAmount: { type: Number, default: null }, // null = use master value
      },
    ],
    status: {
      type: String,
      enum: ["active", "locked"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmployeeSalary", employeeSalarySchema);
