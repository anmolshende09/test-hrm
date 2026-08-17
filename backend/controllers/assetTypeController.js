const AssetType = require("../models/AssetType");
const Asset = require("../models/Asset");
const asyncHandler = require("../utils/asyncHandler");

const createAssetType = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const assetType = await AssetType.create({ name, description });
  res.status(201).json({ success: true, data: assetType });
});

const getAssetTypes = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (search) query.$text = { $search: search };

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 20, 1);

  const [assetTypes, total, counts] = await Promise.all([
    AssetType.find(query).sort({ name: 1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    AssetType.countDocuments(query),
    Asset.aggregate([{ $group: { _id: "$assetType", count: { $sum: 1 } } }]),
  ]);

  const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));
  const data = assetTypes.map((t) => ({ ...t.toObject(), assetCount: countMap[t._id.toString()] || 0 }));

  res.json({ success: true, data, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
});

const updateAssetType = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const assetType = await AssetType.findByIdAndUpdate(req.params.id, { name, description }, { new: true, runValidators: true });
  if (!assetType) return res.status(404).json({ success: false, message: "Asset type not found" });
  res.json({ success: true, data: assetType });
});

const deleteAssetType = asyncHandler(async (req, res) => {
  const inUse = await Asset.countDocuments({ assetType: req.params.id });
  if (inUse > 0) return res.status(400).json({ success: false, message: `Cannot delete: ${inUse} asset(s) use this type` });
  const assetType = await AssetType.findByIdAndDelete(req.params.id);
  if (!assetType) return res.status(404).json({ success: false, message: "Asset type not found" });
  res.json({ success: true, message: "Asset type deleted" });
});

module.exports = { createAssetType, getAssetTypes, updateAssetType, deleteAssetType };
