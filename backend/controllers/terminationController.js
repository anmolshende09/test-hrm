const Termination = require("../models/Termination");
const Employee = require("../models/Employee");
const asyncHandler = require("../utils/asyncHandler");

const filePaths = (files) => (files || []).map((f) => `/uploads/lifecycle-documents/${f.filename}`);

// @desc    Create a termination record
// @route   POST /api/terminations
// @access  Private (admin, hr_manager)
const createTermination = asyncHandler(async (req, res) => {
  const { employee, terminationType, terminationDate, noticeDate, status } = req.body;
  const termination = await Termination.create({
    employee,
    terminationType,
    terminationDate,
    noticeDate,
    status,
    documents: filePaths(req.files),
    createdBy: req.user._id,
  });
  const populated = await termination.populate("employee", "name email");
  res.status(201).json({ success: true, data: populated });
});

// @desc    Get terminations with status/type filters + pagination
// @route   GET /api/terminations?status=&terminationType=&page=&limit=
// @access  Private (admin, hr_manager)
const getTerminations = asyncHandler(async (req, res) => {
  const { status, terminationType, page = 1, limit = 10 } = req.query;

  const query = {};
  if (status) query.status = status;
  if (terminationType) query.terminationType = terminationType;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [terminations, total] = await Promise.all([
    Termination.find(query)
      .populate("employee", "name email")
      .sort({ terminationDate: -1 })
      .skip(skip)
      .limit(limitNum),
    Termination.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: terminations,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

// @desc    Update a termination. Finalizing marks the Employee record inactive.
// @route   PUT /api/terminations/:id
// @access  Private (admin, hr_manager)
const updateTermination = asyncHandler(async (req, res) => {
  const { terminationType, terminationDate, noticeDate, status } = req.body;

  const payload = { terminationType, terminationDate, noticeDate, status };
  if (req.files && req.files.length > 0) {
    payload.documents = filePaths(req.files);
  }

  const termination = await Termination.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  }).populate("employee", "name email");
  if (!termination) {
    return res.status(404).json({ success: false, message: "Termination not found" });
  }

  if (status === "finalized") {
    await Employee.findByIdAndUpdate(termination.employee._id, { status: "inactive" });
  }

  res.json({ success: true, data: termination });
});

// @desc    Delete a termination record
// @route   DELETE /api/terminations/:id
// @access  Private (admin, hr_manager)
const deleteTermination = asyncHandler(async (req, res) => {
  const termination = await Termination.findByIdAndDelete(req.params.id);
  if (!termination) {
    return res.status(404).json({ success: false, message: "Termination not found" });
  }
  res.json({ success: true, message: "Termination deleted" });
});

module.exports = { createTermination, getTerminations, updateTermination, deleteTermination };
