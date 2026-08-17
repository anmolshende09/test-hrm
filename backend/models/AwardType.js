const mongoose = require("mongoose");

const awardTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Award type name is required"],
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

awardTypeSchema.index({ name: "text" });

module.exports = mongoose.model("AwardType", awardTypeSchema);
