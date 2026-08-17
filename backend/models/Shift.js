const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Shift name is required"],
      unique: true,
      trim: true,
    },
    // Stored as "HH:MM" (24-hour). endTime before startTime means the shift
    // crosses midnight (e.g. a Night Shift 22:00 -> 06:00) — handled when
    // computing working hours, not treated as invalid.
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Start time must be in HH:MM 24-hour format"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "End time must be in HH:MM 24-hour format"],
    },
    breakDuration: {
      type: Number, // minutes
      default: 0,
      min: 0,
    },
    gracePeriod: {
      type: Number, // minutes an employee can clock in late before being marked Late
      default: 0,
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

shiftSchema.index({ name: "text" });

module.exports = mongoose.model("Shift", shiftSchema);
