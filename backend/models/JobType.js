const mongoose = require("mongoose");

const jobTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Job type name is required"],
      unique: true,
      trim: true,
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

jobTypeSchema.index({ name: "text" });

module.exports = mongoose.model("JobType", jobTypeSchema);
