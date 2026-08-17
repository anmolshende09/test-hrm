const mongoose = require("mongoose");

const salaryComponentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Component name is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    type: {
      type: String,
      enum: ["earning", "deduction"],
      required: [true, "Component type is required"],
    },
    calculationType: {
      type: String,
      enum: ["fixed", "percentage"],
      required: [true, "Calculation type is required"],
    },
    // fixed → absolute currency amount; percentage → % of basic salary
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "locked"],
      default: "active",
    },
  },
  { timestamps: true }
);

salaryComponentSchema.index({ name: "text" });

module.exports = mongoose.model("SalaryComponent", salaryComponentSchema);
