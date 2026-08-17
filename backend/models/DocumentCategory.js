const mongoose = require("mongoose");

const documentCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    color: {
      type: String,
      trim: true,
      default: "#0066cc",
    },
    icon: {
      type: String,
      trim: true,
      default: "folder",
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isMandatory: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

documentCategorySchema.index({ name: "text" });

module.exports = mongoose.model("DocumentCategory", documentCategorySchema);