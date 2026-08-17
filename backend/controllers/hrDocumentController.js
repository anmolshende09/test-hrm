const path = require("path");
const fs = require("fs");
const HRDocument = require("../models/HRDocument");
const asyncHandler = require("../utils/asyncHandler");

const POPULATE_CATEGORY = "name color icon isMandatory";
const POPULATE_USER = "name email";

const createHRDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "A file is required" });
  }

  const { title, description, category, version, status, effectiveDate, expiryDate, requiresAcknowledgment } = req.body;

  const hrDocument = await HRDocument.create({
    title,
    description,
    category,
    fileName: req.file.originalname,
    filePath: `/uploads/hr-documents/${req.file.filename}`,
    fileType: path.extname(req.file.originalname).replace(".", "").toUpperCase(),
    fileSize: req.file.size,
    version,
    status,
    effectiveDate: effectiveDate || null,
    expiryDate: expiryDate || null,
    requiresAcknowledgment,
    uploadedBy: req.user._id,
  });

  const populated = await hrDocument.populate([
    { path: "category", select: POPULATE_CATEGORY },
    { path: "uploadedBy", select: POPULATE_USER },
  ]);

  res.status(201).json({ success: true, data: populated });
});

const getHRDocuments = asyncHandler(async (req, res) => {
  const { search, category, status, page = 1, limit = 10 } = req.query;

  const query = {};
  if (search) query.$text = { $search: search };
  if (category) query.category = category;
  if (status) query.status = status;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [hrDocuments, total] = await Promise.all([
    HRDocument.find(query)
      .populate("category", POPULATE_CATEGORY)
      .populate("uploadedBy", POPULATE_USER)
      .populate("approvedBy", POPULATE_USER)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    HRDocument.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: hrDocuments,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

const getHRDocument = asyncHandler(async (req, res) => {
  const hrDocument = await HRDocument.findById(req.params.id)
    .populate("category", POPULATE_CATEGORY)
    .populate("uploadedBy", POPULATE_USER)
    .populate("approvedBy", POPULATE_USER);

  if (!hrDocument) {
    return res.status(404).json({ success: false, message: "Document not found" });
  }
  res.json({ success: true, data: hrDocument });
});

const updateHRDocument = asyncHandler(async (req, res) => {
  const { title, description, category, version, status, effectiveDate, expiryDate, requiresAcknowledgment } = req.body;

  const hrDocument = await HRDocument.findById(req.params.id);
  if (!hrDocument) {
    return res.status(404).json({ success: false, message: "Document not found" });
  }

  hrDocument.title = title ?? hrDocument.title;
  hrDocument.description = description ?? hrDocument.description;
  hrDocument.category = category ?? hrDocument.category;
  hrDocument.version = version ?? hrDocument.version;
  hrDocument.status = status ?? hrDocument.status;
  hrDocument.effectiveDate = effectiveDate || null;
  hrDocument.expiryDate = expiryDate || null;
  if (requiresAcknowledgment !== undefined) hrDocument.requiresAcknowledgment = requiresAcknowledgment;

  // Replacing the file is optional on update — only swap it if a new one was uploaded
  if (req.file) {
    const oldPath = path.join(__dirname, "..", hrDocument.filePath);
    fs.unlink(oldPath, () => {}); // best-effort cleanup, ignore errors
    hrDocument.fileName = req.file.originalname;
    hrDocument.filePath = `/uploads/hr-documents/${req.file.filename}`;
    hrDocument.fileType = path.extname(req.file.originalname).replace(".", "").toUpperCase();
    hrDocument.fileSize = req.file.size;
  }

  await hrDocument.save();
  const populated = await hrDocument.populate([
    { path: "category", select: POPULATE_CATEGORY },
    { path: "uploadedBy", select: POPULATE_USER },
    { path: "approvedBy", select: POPULATE_USER },
  ]);

  res.json({ success: true, data: populated });
});

// Stamps approval and publishes the document in one step, per the doc's
// "reviewed through an approval workflow before being published" flow.
const approveHRDocument = asyncHandler(async (req, res) => {
  const hrDocument = await HRDocument.findByIdAndUpdate(
    req.params.id,
    { status: "published", approvedBy: req.user._id, approvedAt: new Date() },
    { new: true }
  )
    .populate("category", POPULATE_CATEGORY)
    .populate("uploadedBy", POPULATE_USER)
    .populate("approvedBy", POPULATE_USER);

  if (!hrDocument) {
    return res.status(404).json({ success: false, message: "Document not found" });
  }
  res.json({ success: true, data: hrDocument });
});

// Called by the frontend right before opening the static file link,
// mirroring how attachments are already served directly via /uploads.
const trackDownload = asyncHandler(async (req, res) => {
  const hrDocument = await HRDocument.findByIdAndUpdate(
    req.params.id,
    { $inc: { downloadCount: 1 } },
    { new: true }
  ).select("downloadCount");

  if (!hrDocument) {
    return res.status(404).json({ success: false, message: "Document not found" });
  }
  res.json({ success: true, data: { downloadCount: hrDocument.downloadCount } });
});

const deleteHRDocument = asyncHandler(async (req, res) => {
  const hrDocument = await HRDocument.findByIdAndDelete(req.params.id);
  if (!hrDocument) {
    return res.status(404).json({ success: false, message: "Document not found" });
  }
  const filePath = path.join(__dirname, "..", hrDocument.filePath);
  fs.unlink(filePath, () => {}); // best-effort cleanup, ignore errors
  res.json({ success: true, message: "Document deleted" });
});

module.exports = {
  createHRDocument,
  getHRDocuments,
  getHRDocument,
  updateHRDocument,
  approveHRDocument,
  trackDownload,
  deleteHRDocument,
};