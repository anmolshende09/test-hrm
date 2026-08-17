const mongoose = require("mongoose");

const documentTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Document type name is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    required: {
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

documentTypeSchema.index({ name: "text" });

module.exports = mongoose.model("DocumentType", documentTypeSchema);
