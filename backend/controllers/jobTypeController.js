const JobType = require("../models/JobType");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Create a job type
// @route   POST /api/job-types
// @access  Private (admin, hr_manager)
const createJobType = asyncHandler(async (req, res) => {
  const { name, description, status } = req.body;
  const jobType = await JobType.create({ name, description, status });
  res.status(201).json({ success: true, data: jobType });
});

// @desc    Get job types with search + status filter + pagination
// @route   GET /api/job-types?search=&status=&page=&limit=
// @access  Private
const getJobTypes = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 10 } = req.query;

  const query = {};
  if (search) query.$text = { $search: search };
  if (status) query.status = status;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [jobTypes, total] = await Promise.all([
    JobType.find(query).sort({ name: 1 }).skip(skip).limit(limitNum),
    JobType.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: jobTypes,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

// @desc    Lightweight list for dropdowns (e.g. Job Postings form)
// @route   GET /api/job-types/all
// @access  Private
const getAllJobTypes = asyncHandler(async (req, res) => {
  const jobTypes = await JobType.find({ status: "active" }).select("name").sort({ name: 1 });
  res.json({ success: true, data: jobTypes });
});

// @desc    Update a job type
// @route   PUT /api/job-types/:id
// @access  Private (admin, hr_manager)
const updateJobType = asyncHandler(async (req, res) => {
  const { name, description, status } = req.body;
  const jobType = await JobType.findByIdAndUpdate(
    req.params.id,
    { name, description, status },
    { new: true, runValidators: true }
  );
  if (!jobType) {
    return res.status(404).json({ success: false, message: "Job type not found" });
  }
  res.json({ success: true, data: jobType });
});

// @desc    Delete a job type
// @route   DELETE /api/job-types/:id
// @access  Private (admin)
const deleteJobType = asyncHandler(async (req, res) => {
  const jobType = await JobType.findByIdAndDelete(req.params.id);
  if (!jobType) {
    return res.status(404).json({ success: false, message: "Job type not found" });
  }
  res.json({ success: true, message: "Job type deleted" });
});

module.exports = { createJobType, getJobTypes, getAllJobTypes, updateJobType, deleteJobType };
