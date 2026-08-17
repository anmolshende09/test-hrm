const path = require("path");
const fs = require("fs");
const MediaFile = require("../models/MediaFile");
const asyncHandler = require("../utils/asyncHandler");

const POPULATE_USER = "name email";

// Derives a readable default display name from the raw filename —
// "company-social-banner.png" -> "Company Social Banner".
const deriveDisplayName = (originalName) => {
  const base = originalName.replace(/\.[^/.]+$/, "");
  return base
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

// Handles one or many files in a single request — §21 "Choose Files".
const uploadMediaFiles = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: "At least one file is required" });
  }

  const { folder } = req.body;

  const docs = await MediaFile.insertMany(
    req.files.map((file) => ({
      fileName: file.originalname,
      displayName: deriveDisplayName(file.originalname),
      filePath: `/uploads/media-library/${file.filename}`,
      fileType: file.mimetype,
      fileSize: file.size,
      folder: folder || null,
      uploadedBy: req.user._id,
    }))
  );

  res.status(201).json({ success: true, data: docs });
});

const getMediaFiles = asyncHandler(async (req, res) => {
  const { search, folder, type, sort = "-createdAt", page = 1, limit = 50 } = req.query;

  const query = {};
  if (search) query.$text = { $search: search };
  if (folder) query.folder = folder === "unfiled" ? null : folder;
  if (type === "image") query.fileType = { $regex: "^image/" };
  if (type === "other") query.fileType = { $not: { $regex: "^image/" } };

  const sortMap = {
    "-createdAt": { createdAt: -1 },
    createdAt: { createdAt: 1 },
    name: { displayName: 1 },
    "-name": { displayName: -1 },
    size: { fileSize: 1 },
    "-size": { fileSize: -1 },
  };

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 50, 1);
  const skip = (pageNum - 1) * limitNum;

  const [files, total] = await Promise.all([
    MediaFile.find(query)
      .populate("uploadedBy", POPULATE_USER)
      .sort(sortMap[sort] || sortMap["-createdAt"])
      .skip(skip)
      .limit(limitNum),
    MediaFile.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: files,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

// §13/§45 — totals always reflect the whole library, not the current
// folder/search filter, matching "All Files" count == toolbar "Total Files".
const getMediaStats = asyncHandler(async (req, res) => {
  const [totalFiles, totalImages, storageAgg] = await Promise.all([
    MediaFile.countDocuments(),
    MediaFile.countDocuments({ fileType: { $regex: "^image/" } }),
    MediaFile.aggregate([{ $group: { _id: null, total: { $sum: "$fileSize" } } }]),
  ]);

  res.json({
    success: true,
    data: {
      totalFiles,
      totalImages,
      totalStorage: storageAgg[0]?.total || 0,
    },
  });
});

const updateMediaFile = asyncHandler(async (req, res) => {
  const { displayName, folder } = req.body;
  const update = {};
  if (displayName !== undefined) update.displayName = displayName;
  if (folder !== undefined) update.folder = folder || null;

  const file = await MediaFile.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!file) {
    return res.status(404).json({ success: false, message: "File not found" });
  }
  res.json({ success: true, data: file });
});

const deleteMediaFile = asyncHandler(async (req, res) => {
  const file = await MediaFile.findByIdAndDelete(req.params.id);
  if (!file) {
    return res.status(404).json({ success: false, message: "File not found" });
  }
  const diskPath = path.join(__dirname, "..", file.filePath);
  fs.unlink(diskPath, () => {}); // best-effort cleanup, ignore errors
  res.json({ success: true, message: "File deleted" });
});

module.exports = { uploadMediaFiles, getMediaFiles, getMediaStats, updateMediaFile, deleteMediaFile };