const DocumentCategory = require("../models/DocumentCategory");
const asyncHandler = require("../utils/asyncHandler");

const createDocumentCategory = asyncHandler(async (req, res) => {
  const { name, description, color, icon, sortOrder, isMandatory, status } = req.body;

  const documentCategory = await DocumentCategory.create({
    name,
    description,
    color,
    icon,
    sortOrder: sortOrder === "" || sortOrder === undefined ? 0 : sortOrder,
    isMandatory,
    status,
  });

  res.status(201).json({ success: true, data: documentCategory });
});

const getDocumentCategories = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 10 } = req.query;

  const query = {};
  if (search) query.$text = { $search: search };
  if (status) query.status = status;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [documentCategories, total] = await Promise.all([
    DocumentCategory.find(query).sort({ sortOrder: 1, name: 1 }).skip(skip).limit(limitNum),
    DocumentCategory.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: documentCategories,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

// Lightweight, unpaginated list of active categories — used by the
// HR Documents form dropdown once that module is built.
const getDocumentCategoriesAll = asyncHandler(async (req, res) => {
  const documentCategories = await DocumentCategory.find({ status: "active" })
    .sort({ sortOrder: 1, name: 1 })
    .select("name color icon isMandatory");
  res.json({ success: true, data: documentCategories });
});

const updateDocumentCategory = asyncHandler(async (req, res) => {
  const { name, description, color, icon, sortOrder, isMandatory, status } = req.body;

  const documentCategory = await DocumentCategory.findByIdAndUpdate(
    req.params.id,
    {
      name,
      description,
      color,
      icon,
      sortOrder: sortOrder === "" || sortOrder === undefined ? 0 : sortOrder,
      isMandatory,
      status,
    },
    { new: true, runValidators: true }
  );

  if (!documentCategory) {
    return res.status(404).json({ success: false, message: "Document category not found" });
  }
  res.json({ success: true, data: documentCategory });
});

const deleteDocumentCategory = asyncHandler(async (req, res) => {
  const documentCategory = await DocumentCategory.findByIdAndDelete(req.params.id);
  if (!documentCategory) {
    return res.status(404).json({ success: false, message: "Document category not found" });
  }
  res.json({ success: true, message: "Document category deleted" });
});

module.exports = {
  createDocumentCategory,
  getDocumentCategories,
  getDocumentCategoriesAll,
  updateDocumentCategory,
  deleteDocumentCategory,
};