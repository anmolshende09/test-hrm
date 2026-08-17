const Candidate = require("../models/Candidate");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Create a candidate
// @route   POST /api/candidates
// @access  Private (admin, hr_manager)
const createCandidate = asyncHandler(async (req, res) => {
  const { name, email, job, source, experience, expectedSalary, status, appliedDate } = req.body;
  const candidate = await Candidate.create({
    name,
    email,
    job,
    source,
    experience,
    expectedSalary,
    status,
    appliedDate,
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, data: candidate });
});

// @desc    Get candidates with search/status/source filters + pagination
// @route   GET /api/candidates?search=&status=&source=&page=&limit=
// @access  Private (admin, hr_manager)
const getCandidates = asyncHandler(async (req, res) => {
  const { search, status, source, page = 1, limit = 10 } = req.query;

  const query = {};
  if (search) query.$text = { $search: search };
  if (status) query.status = status;
  if (source) query.source = source;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [candidates, total] = await Promise.all([
    Candidate.find(query).sort({ appliedDate: -1 }).skip(skip).limit(limitNum),
    Candidate.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: candidates,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

// @desc    Lightweight list for dropdowns (Interviews/Offers forms)
// @route   GET /api/candidates/all
// @access  Private (admin, hr_manager)
const getAllCandidates = asyncHandler(async (req, res) => {
  const candidates = await Candidate.find().select("name email job status").sort({ name: 1 });
  res.json({ success: true, data: candidates });
});

// @desc    Update a candidate
// @route   PUT /api/candidates/:id
// @access  Private (admin, hr_manager)
const updateCandidate = asyncHandler(async (req, res) => {
  const { name, email, job, source, experience, expectedSalary, status, convertedToEmployee } = req.body;
  const candidate = await Candidate.findByIdAndUpdate(
    req.params.id,
    { name, email, job, source, experience, expectedSalary, status, convertedToEmployee },
    { new: true, runValidators: true }
  );
  if (!candidate) {
    return res.status(404).json({ success: false, message: "Candidate not found" });
  }
  res.json({ success: true, data: candidate });
});

// @desc    Delete a candidate
// @route   DELETE /api/candidates/:id
// @access  Private (admin)
const deleteCandidate = asyncHandler(async (req, res) => {
  const candidate = await Candidate.findByIdAndDelete(req.params.id);
  if (!candidate) {
    return res.status(404).json({ success: false, message: "Candidate not found" });
  }
  res.json({ success: true, message: "Candidate deleted" });
});

module.exports = { createCandidate, getCandidates, getAllCandidates, updateCandidate, deleteCandidate };
