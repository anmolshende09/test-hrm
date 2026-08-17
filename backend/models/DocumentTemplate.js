const mongoose = require("mongoose");

const documentTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Template name is required"],
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
      required: [true, "Category is required"],
    },
    templateContent: {
      type: String,
      required: [true, "Template content is required"],
    },
    // Placeholder names referenced in templateContent as {{placeholder_name}}
    placeholders: [{ type: String, trim: true }],
    // Pre-populated values for placeholders, e.g. { key: "company_name", value: "Acme Inc." }
    defaultValues: [
      {
        key: { type: String, trim: true, required: true },
        value: { type: String, trim: true, default: "" },
      },
    ],
    isDefault: {
      type: Boolean,
      default: false,
    },
    fileFormat: {
      type: String,
      enum: ["PDF", "DOC", "DOCX"],
      default: "PDF",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

documentTemplateSchema.index({ name: "text", templateContent: "text" });

module.exports = mongoose.model("DocumentTemplate", documentTemplateSchema);