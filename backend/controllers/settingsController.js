const path = require("path");
const fs = require("fs");
const Settings = require("../models/Settings");
const asyncHandler = require("../utils/asyncHandler");

// Singleton get-or-create — every handler below starts from this so the
// document always exists with sane defaults, even on a fresh database.
const getOrCreateSettings = async () => {
  let settings = await Settings.findOne({ key: "app_settings" });
  if (!settings) {
    settings = await Settings.create({ key: "app_settings" });
  }
  return settings;
};

const getSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  res.json({ success: true, data: settings });
});

const updateSystemSettings = asyncHandler(async (req, res) => {
  const { defaultLanguage, dateFormat, timeFormat, defaultTimezone, ipRestriction, landingPage } = req.body;

  const settings = await Settings.findOneAndUpdate(
    { key: "app_settings" },
    {
      $set: {
        "system.defaultLanguage": defaultLanguage,
        "system.dateFormat": dateFormat,
        "system.timeFormat": timeFormat,
        "system.defaultTimezone": defaultTimezone,
        "system.ipRestriction": ipRestriction,
        "system.landingPage": landingPage,
      },
    },
    { new: true, upsert: true, runValidators: true }
  );

  res.json({ success: true, data: settings.system });
});

// §2.2-2.4 — up to 3 optional files in one multipart request. Any field
// not included in this request is left untouched (only replaced when a
// new file is actually uploaded for that specific slot).
const updateBrandSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  const files = req.files || {};

  const replaceAsset = (fieldName, formKey) => {
    if (files[formKey] && files[formKey][0]) {
      if (settings.brand[fieldName]) {
        fs.unlink(path.join(__dirname, "..", settings.brand[fieldName]), () => {});
      }
      settings.brand[fieldName] = `/uploads/brand/${files[formKey][0].filename}`;
    }
  };

  replaceAsset("logoDark", "logoDark");
  replaceAsset("logoLight", "logoLight");
  replaceAsset("favicon", "favicon");

  await settings.save();
  res.json({ success: true, data: settings.brand });
});

// §2.2-2.4 X button — removes one specific brand asset.
const removeBrandAsset = asyncHandler(async (req, res) => {
  const { field } = req.params;
  if (!["logoDark", "logoLight", "favicon"].includes(field)) {
    return res.status(400).json({ success: false, message: "Invalid asset field" });
  }

  const settings = await getOrCreateSettings();
  if (settings.brand[field]) {
    fs.unlink(path.join(__dirname, "..", settings.brand[field]), () => {});
  }
  settings.brand[field] = null;
  await settings.save();

  res.json({ success: true, data: settings.brand });
});

const updateEmailSettings = asyncHandler(async (req, res) => {
  const { provider, mailDriver, smtpHost, smtpPort, smtpUsername, smtpPassword, mailEncryption, fromAddress, fromName } = req.body;

  const update = {
    "email.provider": provider,
    "email.mailDriver": mailDriver,
    "email.smtpHost": smtpHost,
    "email.smtpPort": smtpPort,
    "email.smtpUsername": smtpUsername,
    "email.mailEncryption": mailEncryption,
    "email.fromAddress": fromAddress,
    "email.fromName": fromName,
  };
  // Password only overwritten if a new one was actually submitted — same
  // pattern as User password updates elsewhere in this app.
  if (smtpPassword) update["email.smtpPassword"] = smtpPassword;

  await Settings.findOneAndUpdate({ key: "app_settings" }, { $set: update }, { upsert: true, runValidators: true });
  const settings = await Settings.findOne({ key: "app_settings" }); // re-fetch without +password
  res.json({ success: true, data: settings.email });
});

// §3.10-3.12 — requires the `nodemailer` package, which is not currently
// in this project's dependencies (not seen anywhere in prior sessions).
// Run `npm install nodemailer` in backend/ before this endpoint will work;
// it's required lazily below so the rest of the app doesn't crash if it's
// still missing.
const sendTestEmail = asyncHandler(async (req, res) => {
  const { testRecipient } = req.body;
  if (!testRecipient) {
    return res.status(400).json({ success: false, message: "A recipient email is required" });
  }

  let nodemailer;
  try {
    nodemailer = require("nodemailer");
  } catch {
    return res.status(500).json({
      success: false,
      message: "The 'nodemailer' package is not installed. Run `npm install nodemailer` in backend/ to enable test emails.",
    });
  }

  const settings = await Settings.findOne({ key: "app_settings" }).select("+email.smtpPassword");
  const { smtpHost, smtpPort, smtpUsername, smtpPassword, mailEncryption, fromAddress, fromName } = settings.email;

  if (!smtpHost || !smtpUsername || !smtpPassword) {
    return res.status(400).json({ success: false, message: "Save your SMTP configuration before sending a test email" });
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(smtpPort) || 587,
    secure: mailEncryption === "ssl",
    auth: { user: smtpUsername, pass: smtpPassword },
  });

  try {
    await transporter.sendMail({
      from: `"${fromName || "HRMS"}" <${fromAddress || smtpUsername}>`,
      to: testRecipient,
      subject: "HRMS Test Email",
      text: "This is a test email from your HRMS email configuration.",
    });
    res.json({ success: true, message: "Test email sent" });
  } catch (err) {
    res.status(500).json({ success: false, message: `Couldn't send test email: ${err.message}` });
  }
});

const updateWorkingDaysSettings = asyncHandler(async (req, res) => {
  const { monday, tuesday, wednesday, thursday, friday, saturday, sunday } = req.body;

  const settings = await Settings.findOneAndUpdate(
    { key: "app_settings" },
    {
      $set: {
        "workingDays.monday": monday,
        "workingDays.tuesday": tuesday,
        "workingDays.wednesday": wednesday,
        "workingDays.thursday": thursday,
        "workingDays.friday": friday,
        "workingDays.saturday": saturday,
        "workingDays.sunday": sunday,
      },
    },
    { new: true, upsert: true, runValidators: true }
  );

  res.json({ success: true, data: settings.workingDays });
});

const updateStorageSettings = asyncHandler(async (req, res) => {
  const { activeProvider, local, awsS3 } = req.body;

  const update = {};
  if (activeProvider) update["storage.activeProvider"] = activeProvider;
  if (local) {
    if (local.allowedFileTypes) update["storage.local.allowedFileTypes"] = local.allowedFileTypes;
    if (local.maxUploadSizeKB !== undefined) update["storage.local.maxUploadSizeKB"] = local.maxUploadSizeKB;
  }
  if (awsS3) {
    if (awsS3.accessKeyId !== undefined) update["storage.awsS3.accessKeyId"] = awsS3.accessKeyId;
    if (awsS3.secretAccessKey) update["storage.awsS3.secretAccessKey"] = awsS3.secretAccessKey; // only overwrite if provided
    if (awsS3.region !== undefined) update["storage.awsS3.region"] = awsS3.region;
    if (awsS3.bucket !== undefined) update["storage.awsS3.bucket"] = awsS3.bucket;
    if (awsS3.url !== undefined) update["storage.awsS3.url"] = awsS3.url;
    if (awsS3.endpoint !== undefined) update["storage.awsS3.endpoint"] = awsS3.endpoint;
    if (awsS3.allowedFileTypes) update["storage.awsS3.allowedFileTypes"] = awsS3.allowedFileTypes;
    if (awsS3.maxUploadSizeKB !== undefined) update["storage.awsS3.maxUploadSizeKB"] = awsS3.maxUploadSizeKB;
  }

  await Settings.findOneAndUpdate({ key: "app_settings" }, { $set: update }, { upsert: true, runValidators: true });
  const settings = await Settings.findOne({ key: "app_settings" });
  res.json({ success: true, data: settings.storage });
});

module.exports = {
  getSettings,
  updateSystemSettings,
  updateBrandSettings,
  removeBrandAsset,
  updateEmailSettings,
  sendTestEmail,
  updateWorkingDaysSettings,
  updateStorageSettings,
};
