const Branch = require("../models/Branch");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Create a branch
// @route   POST /api/branches
// @access  Private (admin, hr_manager)
const createBranch = asyncHandler(async (req, res) => {
  const { name, address, phone, email, status } = req.body;
  const branch = await Branch.create({ name, address, phone, email, status });
  res.status(201).json({ success: true, data: branch });
});

// @desc    List branches with search + pagination
// @route   GET /api/branches?search=&status=&page=&limit=
// @access  Private
const getBranches = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 10 } = req.query;

  const query = {};
  if (search) query.$text = { $search: search };
  if (status) query.status = status;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [branches, total] = await Promise.all([
    Branch.find(query).sort({ name: 1 }).skip(skip).limit(limitNum),
    Branch.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: branches,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

// @desc    Get a single branch
// @route   GET /api/branches/:id
// @access  Private
const getBranch = asyncHandler(async (req, res) => {
  const branch = await Branch.findById(req.params.id);
  if (!branch) {
    return res.status(404).json({ success: false, message: "Branch not found" });
  }
  res.json({ success: true, data: branch });
});

// @desc    Get every branch as a lightweight list (for dropdowns: Department,
//          Designation, Holiday branch-assignment, Announcement audience).
// @route   GET /api/branches/all
// @access  Private
const getAllBranches = asyncHandler(async (req, res) => {
  const branches = await Branch.find().select("name status").sort({ name: 1 });
  res.json({ success: true, data: branches });
});

// @desc    Update a branch
// @route   PUT /api/branches/:id
// @access  Private (admin, hr_manager)
const updateBranch = asyncHandler(async (req, res) => {
  const { name, address, phone, email, status } = req.body;
  const branch = await Branch.findByIdAndUpdate(
    req.params.id,
    { name, address, phone, email, status },
    { new: true, runValidators: true }
  );
  if (!branch) {
    return res.status(404).json({ success: false, message: "Branch not found" });
  }
  res.json({ success: true, data: branch });
});

// @desc    Delete a branch (blocked while any department still references it)
// @route   DELETE /api/branches/:id
// @access  Private (admin)
const deleteBranch = asyncHandler(async (req, res) => {
  const Department = require("../models/Department");
  const inUse = await Department.countDocuments({ branch: req.params.id });
  if (inUse > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete branch: ${inUse} department(s) are still assigned to it`,
    });
  }

  const branch = await Branch.findByIdAndDelete(req.params.id);
  if (!branch) {
    return res.status(404).json({ success: false, message: "Branch not found" });
  }
  res.json({ success: true, message: "Branch deleted" });
});

module.exports = { createBranch, getBranches, getBranch, getAllBranches, updateBranch, deleteBranch };
