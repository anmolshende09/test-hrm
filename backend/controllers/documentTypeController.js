const DocumentType = require("../models/DocumentType");
const asyncHandler = require("../utils/asyncHandler");

const createDocumentType = asyncHandler(async (req, res) => {
  const { name, description, required, status } = req.body;
  const documentType = await DocumentType.create({ name, description, required, status });
  res.status(201).json({ success: true, data: documentType });
});

const getDocumentTypes = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 10 } = req.query;

  const query = {};
  if (search) query.$text = { $search: search };
  if (status) query.status = status;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [documentTypes, total] = await Promise.all([
    DocumentType.find(query).sort({ name: 1 }).skip(skip).limit(limitNum),
    DocumentType.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: documentTypes,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

const updateDocumentType = asyncHandler(async (req, res) => {
  const { name, description, required, status } = req.body;
  const documentType = await DocumentType.findByIdAndUpdate(
    req.params.id,
    { name, description, required, status },
    { new: true, runValidators: true }
  );
  if (!documentType) {
    return res.status(404).json({ success: false, message: "Document type not found" });
  }
  res.json({ success: true, data: documentType });
});

const deleteDocumentType = asyncHandler(async (req, res) => {
  const documentType = await DocumentType.findByIdAndDelete(req.params.id);
  if (!documentType) {
    return res.status(404).json({ success: false, message: "Document type not found" });
  }
  res.json({ success: true, message: "Document type deleted" });
});

module.exports = { createDocumentType, getDocumentTypes, updateDocumentType, deleteDocumentType };
