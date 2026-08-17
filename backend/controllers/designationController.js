const Designation = require("../models/Designation");
const Employee = require("../models/Employee");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Create a designation, assigned to a department
// @route   POST /api/designations
// @access  Private (admin, hr_manager)
const createDesignation = asyncHandler(async (req, res) => {
  const { name, department, status } = req.body;
  const designation = await Designation.create({ name, department, status });
  const populated = await designation.populate({ path: "department", select: "name branch", populate: { path: "branch", select: "name" } });
  res.status(201).json({ success: true, data: populated });
});

// @desc    List designations with search + filter (department) + pagination.
//          Each result includes its department's branch info, per spec's
//          "Branch Information" requirement for this module.
// @route   GET /api/designations?search=&department=&status=&page=&limit=
// @access  Private
const getDesignations = asyncHandler(async (req, res) => {
  const { search, department, status, page = 1, limit = 10 } = req.query;

  const query = {};
  if (search) query.$text = { $search: search };
  if (department) query.department = department;
  if (status) query.status = status;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [designations, total] = await Promise.all([
    Designation.find(query)
      .populate({ path: "department", select: "name branch", populate: { path: "branch", select: "name" } })
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum),
    Designation.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: designations,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

// @desc    Lightweight list for dropdowns (e.g. Employee form's "Designation"
//          select, optionally scoped to the currently-selected department).
// @route   GET /api/designations/all?department=
// @access  Private
const getAllDesignations = asyncHandler(async (req, res) => {
  const { department } = req.query;
  const query = { status: "active" };
  if (department) query.department = department;

  const designations = await Designation.find(query).select("name department").sort({ name: 1 });
  res.json({ success: true, data: designations });
});

// @desc    Get a single designation
// @route   GET /api/designations/:id
// @access  Private
const getDesignation = asyncHandler(async (req, res) => {
  const designation = await Designation.findById(req.params.id).populate({
    path: "department",
    select: "name branch",
    populate: { path: "branch", select: "name" },
  });
  if (!designation) {
    return res.status(404).json({ success: false, message: "Designation not found" });
  }
  res.json({ success: true, data: designation });
});

// @desc    Update a designation
// @route   PUT /api/designations/:id
// @access  Private (admin, hr_manager)
const updateDesignation = asyncHandler(async (req, res) => {
  const { name, department, status } = req.body;
  const designation = await Designation.findByIdAndUpdate(
    req.params.id,
    { name, department, status },
    { new: true, runValidators: true }
  ).populate({ path: "department", select: "name branch", populate: { path: "branch", select: "name" } });
  if (!designation) {
    return res.status(404).json({ success: false, message: "Designation not found" });
  }
  res.json({ success: true, data: designation });
});

// @desc    Delete a designation
// @route   DELETE /api/designations/:id
// @access  Private (admin)
const deleteDesignation = asyncHandler(async (req, res) => {
  const inUse = await Employee.countDocuments({ designation: req.params.id });
  if (inUse > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete designation: ${inUse} employee(s) are still assigned to it`,
    });
  }

  const designation = await Designation.findByIdAndDelete(req.params.id);
  if (!designation) {
    return res.status(404).json({ success: false, message: "Designation not found" });
  }
  res.json({ success: true, message: "Designation deleted" });
});

module.exports = {
  createDesignation,
  getDesignations,
  getAllDesignations,
  getDesignation,
  updateDesignation,
  deleteDesignation,
};
