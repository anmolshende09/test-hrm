const mongoose = require("mongoose");

// Singleton — always exactly one document, looked up by `key`.
// A single doc avoids ID-juggling for app-wide config, and lets every
// section save as a targeted $set on the same record.
const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "app_settings",
      unique: true,
    },

    // §1 System Settings
    system: {
      defaultLanguage: { type: String, default: "en" },
      dateFormat: { type: String, default: "Y-m-d" },
      timeFormat: { type: String, default: "H:i" },
      defaultTimezone: { type: String, default: "UTC" },
      ipRestriction: { type: Boolean, default: false },
      landingPage: { type: Boolean, default: true },
    },

    // §2 Brand Settings — only Logos tab fields are specified; Text/Theme
    // tabs exist as UI only (§2.1 explicitly says their fields aren't
    // documented), so no backend fields for them.
    brand: {
      logoDark: { type: String, default: null }, // relative path e.g. /uploads/brand/xyz.png
      logoLight: { type: String, default: null },
      favicon: { type: String, default: null },
    },

    // §3 Email Settings
    email: {
      provider: { type: String, default: "smtp" },
      mailDriver: { type: String, default: "smtp" },
      smtpHost: { type: String, default: "" },
      smtpPort: { type: String, default: "587" },
      smtpUsername: { type: String, default: "" },
      smtpPassword: { type: String, default: "", select: false }, // never returned by default queries
      mailEncryption: { type: String, default: "tls" },
      fromAddress: { type: String, default: "" },
      fromName: { type: String, default: "" },
    },

    // §4 Working Days Settings
    workingDays: {
      monday: { type: Boolean, default: true },
      tuesday: { type: Boolean, default: true },
      wednesday: { type: Boolean, default: true },
      thursday: { type: Boolean, default: true },
      friday: { type: Boolean, default: true },
      saturday: { type: Boolean, default: false },
      sunday: { type: Boolean, default: false },
    },

    // §5-8 Storage Settings — Wasabi has no documented sub-fields (§8.1
    // explicitly forbids inventing them), so it's tab-selectable only.
    storage: {
      activeProvider: { type: String, enum: ["local", "aws_s3", "wasabi"], default: "local" },
      local: {
        allowedFileTypes: { type: [String], default: ["csv", "doc", "docx", "gif", "jpg", "pdf", "png", "txt", "webp"] },
        maxUploadSizeKB: { type: Number, default: 2048 },
      },
      awsS3: {
        accessKeyId: { type: String, default: "" },
        secretAccessKey: { type: String, default: "", select: false },
        region: { type: String, default: "" },
        bucket: { type: String, default: "" },
        url: { type: String, default: "" },
        endpoint: { type: String, default: "" },
        allowedFileTypes: { type: [String], default: ["csv", "doc", "docx", "gif", "jpg", "pdf", "png", "txt", "webp"] },
        maxUploadSizeKB: { type: Number, default: 2048 },
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
