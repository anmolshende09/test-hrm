const mongoose = require("mongoose");

const contractTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Contract type name is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    defaultDurationMonths: {
      type: Number,
      default: null,
      min: 0,
    },
    probationPeriodMonths: {
      type: Number,
      default: null,
      min: 0,
    },
    noticePeriodDays: {
      type: Number,
      default: null,
      min: 0,
    },
    isRenewable: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

contractTypeSchema.index({ name: "text" });

module.exports = mongoose.model("ContractType", contractTypeSchema);