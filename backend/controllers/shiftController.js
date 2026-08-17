const Shift = require("../models/Shift");
const Employee = require("../models/Employee");
const asyncHandler = require("../utils/asyncHandler");
const { computeWorkingMinutes, formatMinutesAsHours } = require("../utils/shiftTime");

const withComputedFields = (shift) => {
  const minutes = computeWorkingMinutes(shift.startTime, shift.endTime, shift.breakDuration);
  return {
    ...shift.toObject(),
    workingMinutes: minutes,
    workingHoursLabel: formatMinutesAsHours(minutes),
  };
};

// @desc    Create a shift
// @route   POST /api/shifts
// @access  Private (admin, hr_manager)
const createShift = asyncHandler(async (req, res) => {
  const { name, startTime, endTime, breakDuration, gracePeriod, description, status } = req.body;
  const shift = await Shift.create({ name, startTime, endTime, breakDuration, gracePeriod, description, status });
  res.status(201).json({ success: true, data: withComputedFields(shift) });
});

// @desc    Get shifts with search + pagination, including live employee counts
//          ("Shift Statistics" from the spec)
// @route   GET /api/shifts?search=&status=&page=&limit=
// @access  Private
const getShifts = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 10 } = req.query;

  const query = {};
  if (search) query.$text = { $search: search };
  if (status) query.status = status;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [shifts, total, counts] = await Promise.all([
    Shift.find(query).sort({ name: 1 }).skip(skip).limit(limitNum),
    Shift.countDocuments(query),
    Employee.aggregate([{ $match: { shift: { $ne: null } } }, { $group: { _id: "$shift", count: { $sum: 1 } } }]),
  ]);

  const countMap = counts.reduce((acc, c) => {
    acc[c._id.toString()] = c.count;
    return acc;
  }, {});

  const data = shifts.map((shift) => ({
    ...withComputedFields(shift),
    employeeCount: countMap[shift._id.toString()] || 0,
  }));

  res.json({
    success: true,
    data,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

// @desc    Lightweight list for dropdowns (e.g. Employee form's "Shift" select)
// @route   GET /api/shifts/all
// @access  Private
const getAllShifts = asyncHandler(async (req, res) => {
  const shifts = await Shift.find({ status: "active" }).select("name startTime endTime").sort({ name: 1 });
  res.json({ success: true, data: shifts });
});

// @desc    Get a single shift
// @route   GET /api/shifts/:id
// @access  Private
const getShift = asyncHandler(async (req, res) => {
  const shift = await Shift.findById(req.params.id);
  if (!shift) {
    return res.status(404).json({ success: false, message: "Shift not found" });
  }
  const employeeCount = await Employee.countDocuments({ shift: shift._id });
  res.json({ success: true, data: { ...withComputedFields(shift), employeeCount } });
});

// @desc    Update a shift
// @route   PUT /api/shifts/:id
// @access  Private (admin, hr_manager)
const updateShift = asyncHandler(async (req, res) => {
  const { name, startTime, endTime, breakDuration, gracePeriod, description, status } = req.body;
  const shift = await Shift.findByIdAndUpdate(
    req.params.id,
    { name, startTime, endTime, breakDuration, gracePeriod, description, status },
    { new: true, runValidators: true }
  );
  if (!shift) {
    return res.status(404).json({ success: false, message: "Shift not found" });
  }
  res.json({ success: true, data: withComputedFields(shift) });
});

// @desc    Delete a shift (blocked while employees are still assigned to it)
// @route   DELETE /api/shifts/:id
// @access  Private (admin)
const deleteShift = asyncHandler(async (req, res) => {
  const inUse = await Employee.countDocuments({ shift: req.params.id });
  if (inUse > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete shift: ${inUse} employee(s) are still assigned to it`,
    });
  }

  const shift = await Shift.findByIdAndDelete(req.params.id);
  if (!shift) {
    return res.status(404).json({ success: false, message: "Shift not found" });
  }
  res.json({ success: true, message: "Shift deleted" });
});

module.exports = { createShift, getShifts, getAllShifts, getShift, updateShift, deleteShift };
