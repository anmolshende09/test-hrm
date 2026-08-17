const mongoose = require("mongoose");

const attendancePolicySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Policy name is required"],
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["standard", "flexible", "strict"],
      required: [true, "Policy type is required"],
    },
    lateArrivalGrace: {
      type: Number, // minutes an employee can clock in late without penalty
      default: 0,
      min: 0,
    },
    earlyDepartureGrace: {
      type: Number, // minutes an employee can leave early without penalty
      default: 0,
      min: 0,
    },
    // Multiplier applied to overtime hours, e.g. 1.5 = time-and-a-half
    overtimeRate: {
      type: Number,
      default: 1.0,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

attendancePolicySchema.index({ name: "text" });

module.exports = mongoose.model("AttendancePolicy", attendancePolicySchema);
