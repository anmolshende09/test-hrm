const LeaveRequest = require("../models/LeaveRequest");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private (employee)
const applyLeave = asyncHandler(async (req, res) => {
  const { employee, leaveType, startDate, endDate, reason } = req.body;
  const leave = await LeaveRequest.create({ employee, leaveType, startDate, endDate, reason });
  res.status(201).json({ success: true, data: leave });
});

// @desc    Get leave requests. Supports filtering by employee/status; admins
//          and HR managers see all requests, employees should pass their own id.
// @route   GET /api/leaves?employee=&status=
// @access  Private
const getLeaves = asyncHandler(async (req, res) => {
  const { employee, status } = req.query;
  const query = {};
  if (employee) query.employee = employee;
  if (status) query.status = status;

  const leaves = await LeaveRequest.find(query)
    .populate("employee", "name employeeId department")
    .sort({ createdAt: -1 });

  res.json({ success: true, count: leaves.length, data: leaves });
});

// @desc    Get a single leave request
// @route   GET /api/leaves/:id
// @access  Private
const getLeave = asyncHandler(async (req, res) => {
  const leave = await LeaveRequest.findById(req.params.id).populate("employee", "name employeeId department");
  if (!leave) {
    return res.status(404).json({ success: false, message: "Leave request not found" });
  }
  res.json({ success: true, data: leave });
});

// @desc    Approve or reject a leave request
// @route   PUT /api/leaves/:id/review
// @access  Private (admin, hr_manager)
const reviewLeave = asyncHandler(async (req, res) => {
  const { status, reviewNote } = req.body;

  const leave = await LeaveRequest.findById(req.params.id);
  if (!leave) {
    return res.status(404).json({ success: false, message: "Leave request not found" });
  }
  if (leave.status !== "pending") {
    return res.status(400).json({ success: false, message: `This request has already been ${leave.status}` });
  }

  leave.status = status;
  leave.reviewNote = reviewNote || "";
  leave.reviewedBy = req.user._id;
  await leave.save();

  res.json({ success: true, data: leave });
});

module.exports = { applyLeave, getLeaves, getLeave, reviewLeave };
