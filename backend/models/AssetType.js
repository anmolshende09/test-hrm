const mongoose = require("mongoose");

const assetTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Asset type name is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

assetTypeSchema.index({ name: "text" });
module.exports = mongoose.model("AssetType", assetTypeSchema);
