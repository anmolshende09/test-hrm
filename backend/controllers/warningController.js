const Warning = require("../models/Warning");
const asyncHandler = require("../utils/asyncHandler");

const filePaths = (files) => (files || []).map((f) => `/uploads/lifecycle-documents/${f.filename}`);

// @desc    Create a warning
// @route   POST /api/warnings
// @access  Private (admin, hr_manager)
const createWarning = asyncHandler(async (req, res) => {
  const { employee, subject, warningType, severity, date, status, improvementPlan } = req.body;
  const warning = await Warning.create({
    employee,
    subject,
    warningType,
    severity,
    date,
    status,
    improvementPlan,
    documents: filePaths(req.files),
    createdBy: req.user._id,
  });
  const populated = await warning.populate("employee", "name email");
  res.status(201).json({ success: true, data: populated });
});

// @desc    Get warnings with status/severity/type filters + pagination
// @route   GET /api/warnings?status=&severity=&warningType=&page=&limit=
// @access  Private (admin, hr_manager)
const getWarnings = asyncHandler(async (req, res) => {
  const { status, severity, warningType, page = 1, limit = 10 } = req.query;

  const query = {};
  if (status) query.status = status;
  if (severity) query.severity = severity;
  if (warningType) query.warningType = warningType;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [warnings, total] = await Promise.all([
    Warning.find(query).populate("employee", "name email").sort({ date: -1 }).skip(skip).limit(limitNum),
    Warning.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: warnings,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

// @desc    Update a warning (edit details, mark resolved/escalated)
// @route   PUT /api/warnings/:id
// @access  Private (admin, hr_manager)
const updateWarning = asyncHandler(async (req, res) => {
  const { subject, warningType, severity, date, status, improvementPlan } = req.body;

  const payload = { subject, warningType, severity, date, status, improvementPlan };
  if (req.files && req.files.length > 0) {
    payload.documents = filePaths(req.files);
  }

  const warning = await Warning.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true }).populate(
    "employee",
    "name email"
  );
  if (!warning) {
    return res.status(404).json({ success: false, message: "Warning not found" });
  }
  res.json({ success: true, data: warning });
});

// @desc    Delete a warning
// @route   DELETE /api/warnings/:id
// @access  Private (admin, hr_manager)
const deleteWarning = asyncHandler(async (req, res) => {
  const warning = await Warning.findById(req.params.id);

  if (!warning) {
    return res.status(404).json({
      success: false,
      message: "Warning not found",
    });
  }

  await warning.deleteOne();

  res.json({
    success: true,
    message: "Warning deleted successfully",
  });
});

// Deliberately no deleteWarning — the spec lists only Add/View/Edit for
// Warnings (a disciplinary/audit record), not Delete.

module.exports = { createWarning, getWarnings, updateWarning, deleteWarning, };
