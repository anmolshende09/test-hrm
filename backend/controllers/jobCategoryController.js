const JobCategory = require("../models/JobCategory");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Create a job category
// @route   POST /api/job-categories
// @access  Private (admin, hr_manager)
const createJobCategory = asyncHandler(async (req, res) => {
  const { name, description, status } = req.body;
  const category = await JobCategory.create({ name, description, status });
  res.status(201).json({ success: true, data: category });
});

// @desc    Get job categories with search + status filter + pagination
// @route   GET /api/job-categories?search=&status=&page=&limit=
// @access  Private
const getJobCategories = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 10 } = req.query;

  const query = {};
  if (search) query.$text = { $search: search };
  if (status) query.status = status;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [categories, total] = await Promise.all([
    JobCategory.find(query).sort({ name: 1 }).skip(skip).limit(limitNum),
    JobCategory.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: categories,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

// @desc    Lightweight list for dropdowns (e.g. Job Postings form)
// @route   GET /api/job-categories/all
// @access  Private
const getAllJobCategories = asyncHandler(async (req, res) => {
  const categories = await JobCategory.find({ status: "active" }).select("name").sort({ name: 1 });
  res.json({ success: true, data: categories });
});

// @desc    Update a job category
// @route   PUT /api/job-categories/:id
// @access  Private (admin, hr_manager)
const updateJobCategory = asyncHandler(async (req, res) => {
  const { name, description, status } = req.body;
  const category = await JobCategory.findByIdAndUpdate(
    req.params.id,
    { name, description, status },
    { new: true, runValidators: true }
  );
  if (!category) {
    return res.status(404).json({ success: false, message: "Job category not found" });
  }
  res.json({ success: true, data: category });
});

// @desc    Delete a job category
// @route   DELETE /api/job-categories/:id
// @access  Private (admin)
const deleteJobCategory = asyncHandler(async (req, res) => {
  const category = await JobCategory.findByIdAndDelete(req.params.id);
  if (!category) {
    return res.status(404).json({ success: false, message: "Job category not found" });
  }
  res.json({ success: true, message: "Job category deleted" });
});

module.exports = { createJobCategory, getJobCategories, getAllJobCategories, updateJobCategory, deleteJobCategory };
