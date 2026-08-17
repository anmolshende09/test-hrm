const mongoose = require("mongoose");

const contractTemplateSchema = new mongoose.Schema(
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
    contractType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ContractType",
      required: [true, "Contract type is required"],
    },
    templateContent: {
      type: String,
      required: [true, "Template content is required"],
    },
    // Variable names referenced in templateContent as {{variable_name}}
    variables: [{ type: String, trim: true }],
    clauses: [{ type: String, trim: true }],
    isDefault: {
      type: Boolean,
      default: false,
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

contractTemplateSchema.index({ name: "text", templateContent: "text" });

module.exports = mongoose.model("ContractTemplate", contractTemplateSchema);