const mongoose = require("mongoose");

const mediaFileSchema = new mongoose.Schema(
  {
    // Physical/original file name, e.g. "company-social-banner.png"
    fileName: {
      type: String,
      required: true,
    },
    // Human-readable name, editable separately from the physical file — §28
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    // MIME type, e.g. "image/png" — §29
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MediaFolder",
      default: null, // null = unfiled, shows under "All Files" only
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

mediaFileSchema.index({ fileName: "text", displayName: "text" });

module.exports = mongoose.model("MediaFile", mediaFileSchema);