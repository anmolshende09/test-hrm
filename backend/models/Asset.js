const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema({
  scheduledDate: { type: Date, required: true },
  description: { type: String, trim: true, default: "" },
  completedDate: { type: Date, default: null },
  status: { type: String, enum: ["scheduled", "completed", "overdue"], default: "scheduled" },
}, { _id: true, timestamps: true });

const assetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Asset name is required"],
      trim: true,
    },
    assetCode: {
      type: String,
      required: [true, "Asset code is required"],
      unique: true,
      trim: true,
    },
    secondaryCode: {
      type: String,
      trim: true,
      default: "",
    },
    assetType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssetType",
      required: [true, "Asset type is required"],
    },
    status: {
      type: String,
      enum: ["available", "assigned", "under_maintenance", "retired"],
      default: "available",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    assignedDate: { type: Date, default: null },
    location: { type: String, trim: true, default: "" },
    purchaseDate: { type: Date, default: null },
    purchaseCost: { type: Number, default: 0, min: 0 },
    warrantyExpiry: { type: Date, default: null },
    // Straight-line depreciation
    depreciationMethod: {
      type: String,
      enum: ["straight_line", "none"],
      default: "straight_line",
    },
    usefulLifeYears: { type: Number, default: 3, min: 0 },
    salvageValue: { type: Number, default: 0, min: 0 },
    maintenanceSchedule: [maintenanceSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

assetSchema.index({ name: "text", assetCode: "text", location: "text" });
module.exports = mongoose.model("Asset", assetSchema);
