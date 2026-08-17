const DocumentTemplate = require("../models/DocumentTemplate");
const asyncHandler = require("../utils/asyncHandler");
const { mergeTemplate } = require("../utils/templateMerge");

const POPULATE_CATEGORY = "name color icon";
const POPULATE_USER = "name email";

const enforceSingleDefault = async (category, excludeId) => {
  await DocumentTemplate.updateMany({ category, _id: { $ne: excludeId } }, { $set: { isDefault: false } });
};

const createDocumentTemplate = asyncHandler(async (req, res) => {
  const { name, description, category, templateContent, placeholders, defaultValues, isDefault, fileFormat, status } = req.body;

  const template = await DocumentTemplate.create({
    name,
    description,
    category,
    templateContent,
    placeholders: placeholders || [],
    defaultValues: defaultValues || [],
    isDefault,
    fileFormat,
    status,
    createdBy: req.user._id,
  });

  if (template.isDefault) await enforceSingleDefault(template.category, template._id);

  const populated = await template.populate("category", POPULATE_CATEGORY);
  res.status(201).json({ success: true, data: populated });
});

const getDocumentTemplates = asyncHandler(async (req, res) => {
  const { search, category, status, page = 1, limit = 10 } = req.query;

  const query = {};
  if (search) query.$text = { $search: search };
  if (category) query.category = category;
  if (status) query.status = status;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [templates, total] = await Promise.all([
    DocumentTemplate.find(query).populate("category", POPULATE_CATEGORY).sort({ name: 1 }).skip(skip).limit(limitNum),
    DocumentTemplate.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: templates,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

const getDocumentTemplate = asyncHandler(async (req, res) => {
  const template = await DocumentTemplate.findById(req.params.id)
    .populate("category", POPULATE_CATEGORY)
    .populate("createdBy", POPULATE_USER);
  if (!template) {
    return res.status(404).json({ success: false, message: "Document template not found" });
  }
  res.json({ success: true, data: template });
});

const updateDocumentTemplate = asyncHandler(async (req, res) => {
  const { name, description, category, templateContent, placeholders, defaultValues, isDefault, fileFormat, status } = req.body;

  const template = await DocumentTemplate.findByIdAndUpdate(
    req.params.id,
    {
      name,
      description,
      category,
      templateContent,
      placeholders: placeholders || [],
      defaultValues: defaultValues || [],
      isDefault,
      fileFormat,
      status,
    },
    { new: true, runValidators: true }
  ).populate("category", POPULATE_CATEGORY);

  if (!template) {
    return res.status(404).json({ success: false, message: "Document template not found" });
  }
  if (template.isDefault) await enforceSingleDefault(template.category._id, template._id);

  res.json({ success: true, data: template });
});

// Returns merged text only — no file is generated. Producing an actual
// PDF/DOCX from this would need a document-rendering library wired in
// separately; this endpoint gives the filled-in content for the user to
// copy or hand off to that step.
const generateDocument = asyncHandler(async (req, res) => {
  const { values } = req.body;

  const template = await DocumentTemplate.findById(req.params.id);
  if (!template) {
    return res.status(404).json({ success: false, message: "Document template not found" });
  }

  const defaultsMap = {};
  (template.defaultValues || []).forEach((dv) => {
    defaultsMap[dv.key] = dv.value;
  });
  const mergedValues = { ...defaultsMap, ...(values || {}) };

  const mergedContent = mergeTemplate(template.templateContent, mergedValues);

  res.json({ success: true, data: { mergedContent, fileFormat: template.fileFormat } });
});

const deleteDocumentTemplate = asyncHandler(async (req, res) => {
  const template = await DocumentTemplate.findByIdAndDelete(req.params.id);
  if (!template) {
    return res.status(404).json({ success: false, message: "Document template not found" });
  }
  res.json({ success: true, message: "Document template deleted" });
});

module.exports = {
  createDocumentTemplate,
  getDocumentTemplates,
  getDocumentTemplate,
  updateDocumentTemplate,
  generateDocument,
  deleteDocumentTemplate,
};