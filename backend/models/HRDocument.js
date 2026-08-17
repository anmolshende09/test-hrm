const mongoose = require("mongoose");

const hrDocumentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Document title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DocumentCategory",
      required: [true, "Document category is required"],
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      default: "",
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    version: {
      type: String,
      trim: true,
      default: "1.0",
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    effectiveDate: {
      type: Date,
      default: null,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    requiresAcknowledgment: {
      type: Boolean,
      default: false,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

hrDocumentSchema.index({ title: "text", description: "text" });

// Computed at query time — never stored, so it's always accurate regardless
// of when the document was last saved (same pattern as Resignation.noticePeriodDays).
hrDocumentSchema.virtual("isExpired").get(function () {
  return !!(this.expiryDate && this.expiryDate.getTime() < Date.now());
});

module.exports = mongoose.model("HRDocument", hrDocumentSchema);