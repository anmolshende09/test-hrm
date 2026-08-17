const MediaFolder = require("../models/MediaFolder");
const MediaFile = require("../models/MediaFile");
const asyncHandler = require("../utils/asyncHandler");

const createMediaFolder = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const folder = await MediaFolder.create({ name, createdBy: req.user._id });
  res.status(201).json({ success: true, data: { ...folder.toObject(), fileCount: 0 } });
});

// Counts are computed live via aggregation — never stored/cached, so they're
// always correct regardless of how files are added, moved, or deleted.
const getMediaFolders = asyncHandler(async (req, res) => {
  const folders = await MediaFolder.find().sort({ name: 1 });
  const counts = await MediaFile.aggregate([
    { $match: { folder: { $ne: null } } },
    { $group: { _id: "$folder", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

  const data = folders.map((folder) => ({
    ...folder.toObject(),
    fileCount: countMap.get(String(folder._id)) || 0,
  }));

  res.json({ success: true, data });
});

const updateMediaFolder = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const folder = await MediaFolder.findByIdAndUpdate(req.params.id, { name }, { new: true, runValidators: true });
  if (!folder) {
    return res.status(404).json({ success: false, message: "Folder not found" });
  }
  res.json({ success: true, data: folder });
});

// Deleting a folder does NOT delete its files — they become unfiled
// (folder: null) and remain visible under "All Files". Non-destructive by
// default; files must be deleted individually and explicitly.
const deleteMediaFolder = asyncHandler(async (req, res) => {
  const folder = await MediaFolder.findByIdAndDelete(req.params.id);
  if (!folder) {
    return res.status(404).json({ success: false, message: "Folder not found" });
  }
  await MediaFile.updateMany({ folder: folder._id }, { $set: { folder: null } });
  res.json({ success: true, message: "Folder deleted — its files were moved to All Files" });
});

module.exports = { createMediaFolder, getMediaFolders, updateMediaFolder, deleteMediaFolder };