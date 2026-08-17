const AttendancePolicy = require("../models/AttendancePolicy");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Create an attendance policy
// @route   POST /api/attendance-policies
// @access  Private (admin, hr_manager)
const createPolicy = asyncHandler(async (req, res) => {
  const { name, type, lateArrivalGrace, earlyDepartureGrace, overtimeRate, description, status } = req.body;
  const policy = await AttendancePolicy.create({
    name,
    type,
    lateArrivalGrace,
    earlyDepartureGrace,
    overtimeRate,
    description,
    status,
  });
  res.status(201).json({ success: true, data: policy });
});

// @desc    Get policies with search/type/status filters + pagination, plus
//          summary statistics (Active Policy Count, Average Grace Time,
//          Average Overtime Rate) computed over the currently ACTIVE set.
// @route   GET /api/attendance-policies?search=&type=&status=&page=&limit=
// @access  Private
const getPolicies = asyncHandler(async (req, res) => {
  const { search, type, status, page = 1, limit = 10 } = req.query;

  const query = {};
  if (search) query.$text = { $search: search };
  if (type) query.type = type;
  if (status) query.status = status;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [policies, total, activePolicies] = await Promise.all([
    AttendancePolicy.find(query).sort({ name: 1 }).skip(skip).limit(limitNum),
    AttendancePolicy.countDocuments(query),
    AttendancePolicy.find({ status: "active" }).select("lateArrivalGrace earlyDepartureGrace overtimeRate"),
  ]);

  const activeCount = activePolicies.length;
  const averageGraceTime =
    activeCount > 0
      ? Math.round(
          (activePolicies.reduce((sum, p) => sum + p.lateArrivalGrace + p.earlyDepartureGrace, 0) / (activeCount * 2)) * 10
        ) / 10
      : 0;
  const averageOvertimeRate =
    activeCount > 0
      ? Math.round((activePolicies.reduce((sum, p) => sum + p.overtimeRate, 0) / activeCount) * 100) / 100
      : 0;

  res.json({
    success: true,
    data: policies,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    stats: { activePolicyCount: activeCount, averageGraceTime, averageOvertimeRate },
  });
});

// @desc    Get a single attendance policy
// @route   GET /api/attendance-policies/:id
// @access  Private
const getPolicy = asyncHandler(async (req, res) => {
  const policy = await AttendancePolicy.findById(req.params.id);
  if (!policy) {
    return res.status(404).json({ success: false, message: "Attendance policy not found" });
  }
  res.json({ success: true, data: policy });
});

// @desc    Update an attendance policy
// @route   PUT /api/attendance-policies/:id
// @access  Private (admin, hr_manager)
const updatePolicy = asyncHandler(async (req, res) => {
  const { name, type, lateArrivalGrace, earlyDepartureGrace, overtimeRate, description, status } = req.body;
  const policy = await AttendancePolicy.findByIdAndUpdate(
    req.params.id,
    { name, type, lateArrivalGrace, earlyDepartureGrace, overtimeRate, description, status },
    { new: true, runValidators: true }
  );
  if (!policy) {
    return res.status(404).json({ success: false, message: "Attendance policy not found" });
  }
  res.json({ success: true, data: policy });
});

// @desc    Delete an attendance policy
// @route   DELETE /api/attendance-policies/:id
// @access  Private (admin)
const deletePolicy = asyncHandler(async (req, res) => {
  const policy = await AttendancePolicy.findByIdAndDelete(req.params.id);
  if (!policy) {
    return res.status(404).json({ success: false, message: "Attendance policy not found" });
  }
  res.json({ success: true, message: "Attendance policy deleted" });
});

module.exports = { createPolicy, getPolicies, getPolicy, updatePolicy, deletePolicy };
