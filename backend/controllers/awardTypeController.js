const AwardType = require("../models/AwardType");
const asyncHandler = require("../utils/asyncHandler");

const createAwardType = asyncHandler(async (req, res) => {
  const { name, description, status } = req.body;
  const awardType = await AwardType.create({ name, description, status });
  res.status(201).json({ success: true, data: awardType });
});

const getAwardTypes = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 10 } = req.query;

  const query = {};
  if (search) query.$text = { $search: search };
  if (status) query.status = status;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [awardTypes, total] = await Promise.all([
    AwardType.find(query).sort({ name: 1 }).skip(skip).limit(limitNum),
    AwardType.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: awardTypes,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

const updateAwardType = asyncHandler(async (req, res) => {
  const { name, description, status } = req.body;
  const awardType = await AwardType.findByIdAndUpdate(
    req.params.id,
    { name, description, status },
    { new: true, runValidators: true }
  );
  if (!awardType) {
    return res.status(404).json({ success: false, message: "Award type not found" });
  }
  res.json({ success: true, data: awardType });
});

const deleteAwardType = asyncHandler(async (req, res) => {
  const awardType = await AwardType.findByIdAndDelete(req.params.id);
  if (!awardType) {
    return res.status(404).json({ success: false, message: "Award type not found" });
  }
  res.json({ success: true, message: "Award type deleted" });
});

module.exports = { createAwardType, getAwardTypes, updateAwardType, deleteAwardType };
