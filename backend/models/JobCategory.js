const mongoose = require("mongoose");

const jobCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Job category name is required"],
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

jobCategorySchema.index({ name: "text" });

module.exports = mongoose.model("JobCategory", jobCategorySchema);
