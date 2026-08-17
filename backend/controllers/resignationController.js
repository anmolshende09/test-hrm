const Resignation = require("../models/Resignation");
const Employee = require("../models/Employee");
const asyncHandler = require("../utils/asyncHandler");

const filePaths = (files) => (files || []).map((f) => `/uploads/lifecycle-documents/${f.filename}`);

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const withNoticePeriod = (resignation) => {
  const obj = resignation.toObject ? resignation.toObject() : resignation;
  const days = Math.round((new Date(obj.lastWorkingDay) - new Date(obj.resignationDate)) / MS_PER_DAY);
  return { ...obj, noticePeriodDays: days };
};

// @desc    Create a resignation record
// @route   POST /api/resignations
// @access  Private (admin, hr_manager)
const createResignation = asyncHandler(async (req, res) => {
  const { employee, resignationDate, lastWorkingDay, status } = req.body;
  const resignation = await Resignation.create({
    employee,
    resignationDate,
    lastWorkingDay,
    status,
    documents: filePaths(req.files),
    createdBy: req.user._id,
  });
  const populated = await resignation.populate("employee", "name email");
  res.status(201).json({ success: true, data: withNoticePeriod(populated) });
});

// @desc    Get resignations with status filter + pagination
// @route   GET /api/resignations?status=&page=&limit=
// @access  Private (admin, hr_manager)
const getResignations = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = {};
  if (status) query.status = status;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [resignations, total] = await Promise.all([
    Resignation.find(query)
      .populate("employee", "name email")
      .sort({ resignationDate: -1 })
      .skip(skip)
      .limit(limitNum),
    Resignation.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: resignations.map(withNoticePeriod),
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

// @desc    Update a resignation. Accepting marks the Employee record inactive.
// @route   PUT /api/resignations/:id
// @access  Private (admin, hr_manager)
const updateResignation = asyncHandler(async (req, res) => {
  const { resignationDate, lastWorkingDay, status } = req.body;

  const payload = { resignationDate, lastWorkingDay, status };
  if (req.files && req.files.length > 0) {
    payload.documents = filePaths(req.files);
  }

  const resignation = await Resignation.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  }).populate("employee", "name email");
  if (!resignation) {
    return res.status(404).json({ success: false, message: "Resignation not found" });
  }

  if (status === "accepted") {
    await Employee.findByIdAndUpdate(resignation.employee._id, { status: "inactive" });
  }

  res.json({ success: true, data: withNoticePeriod(resignation) });
});

// @desc    Delete a resignation record
// @route   DELETE /api/resignations/:id
// @access  Private (admin, hr_manager)
const deleteResignation = asyncHandler(async (req, res) => {
  const resignation = await Resignation.findByIdAndDelete(req.params.id);
  if (!resignation) {
    return res.status(404).json({ success: false, message: "Resignation not found" });
  }
  res.json({ success: true, message: "Resignation deleted" });
});

module.exports = { createResignation, getResignations, updateResignation, deleteResignation };
