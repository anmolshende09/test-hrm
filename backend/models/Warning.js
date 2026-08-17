const mongoose = require("mongoose");

const warningSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    warningType: {
      type: String,
      enum: ["verbal", "written", "final_notice"],
      required: [true, "Warning type is required"],
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "resolved", "escalated"],
      default: "active",
    },
    improvementPlan: {
      type: String,
      trim: true,
      default: "",
    },
    documents: [{ type: String }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Warning", warningSchema);
