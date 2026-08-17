const Interview = require("../models/Interview");
const asyncHandler = require("../utils/asyncHandler");

const withFeedbackStatus = (interview) => ({
  ...interview.toObject(),
  feedbackStatus: interview.feedback ? "submitted" : "pending",
});

// @desc    Schedule an interview
// @route   POST /api/interviews
// @access  Private (admin, hr_manager)
const createInterview = asyncHandler(async (req, res) => {
  const { candidate, round, type, scheduledAt, location, status } = req.body;
  const interview = await Interview.create({
    candidate,
    round,
    type,
    scheduledAt,
    location,
    status,
    createdBy: req.user._id,
  });
  const populated = await interview.populate("candidate", "name email job");
  res.status(201).json({ success: true, data: withFeedbackStatus(populated) });
});

// @desc    Get interviews with search/status/type/candidate filters + pagination
// @route   GET /api/interviews?status=&type=&candidate=&page=&limit=
// @access  Private (admin, hr_manager)
const getInterviews = asyncHandler(async (req, res) => {
  const { status, type, candidate, page = 1, limit = 10 } = req.query;

  const query = {};
  if (status) query.status = status;
  if (type) query.type = type;
  if (candidate) query.candidate = candidate;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [interviews, total] = await Promise.all([
    Interview.find(query)
      .populate("candidate", "name email job")
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Interview.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: interviews.map(withFeedbackStatus),
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

// @desc    Update an interview (reschedule, change status, record feedback)
// @route   PUT /api/interviews/:id
// @access  Private (admin, hr_manager)
const updateInterview = asyncHandler(async (req, res) => {
  const { round, type, scheduledAt, location, status, feedback } = req.body;
  const interview = await Interview.findByIdAndUpdate(
    req.params.id,
    { round, type, scheduledAt, location, status, feedback },
    { new: true, runValidators: true }
  ).populate("candidate", "name email job");
  if (!interview) {
    return res.status(404).json({ success: false, message: "Interview not found" });
  }
  res.json({ success: true, data: withFeedbackStatus(interview) });
});

// @desc    Delete/cancel an interview record
// @route   DELETE /api/interviews/:id
// @access  Private (admin, hr_manager)
const deleteInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findByIdAndDelete(req.params.id);
  if (!interview) {
    return res.status(404).json({ success: false, message: "Interview not found" });
  }
  res.json({ success: true, message: "Interview deleted" });
});

module.exports = { createInterview, getInterviews, updateInterview, deleteInterview };
