const AttendanceRegularization = require("../models/AttendanceRegularization");
const Attendance = require("../models/Attendance");
const asyncHandler = require("../utils/asyncHandler");

const startOfDay = (d) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
};

// @desc    Submit an attendance regularization request. Snapshots the
//          existing Attendance record's checkIn/checkOut (if any) as the
//          "original" values at request time.
// @route   POST /api/attendance-regularizations
// @access  Private (employee, admin, hr_manager)
const createRegularization = asyncHandler(async (req, res) => {
  const { employee, date, requestedCheckIn, requestedCheckOut, reason } = req.body;
  const day = startOfDay(date);

  const existing = await Attendance.findOne({ employee, date: day });

  const request = await AttendanceRegularization.create({
    employee,
    date: day,
    originalCheckIn: existing?.checkIn || null,
    originalCheckOut: existing?.checkOut || null,
    requestedCheckIn,
    requestedCheckOut,
    reason,
  });

  res.status(201).json({ success: true, data: request });
});

// @desc    Get regularization requests with search/status/employee filters +
//          pagination, plus a Pending/Approved/Rejected stats breakdown
//          ("Request Statistics Dashboard" from the spec).
// @route   GET /api/attendance-regularizations?search=&status=&employee=&page=&limit=
// @access  Private
const getRegularizations = asyncHandler(async (req, res) => {
  const { search, status, employee, page = 1, limit = 10 } = req.query;

  const query = {};
  if (status) query.status = status;
  if (employee) query.employee = employee;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  let requestsQuery = AttendanceRegularization.find(query)
    .populate("employee", "name employeeId")
    .sort({ createdAt: -1 });

  // $text search isn't available here (no indexed text fields worth
  // searching), so a simple employee-name search is done post-populate by
  // filtering in memory — acceptable at this data scale, consistent with
  // how small reference lists are handled elsewhere in the app.
  const [allMatching, statusCounts] = await Promise.all([
    requestsQuery,
    AttendanceRegularization.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  const filtered = search
    ? allMatching.filter((r) => r.employee?.name?.toLowerCase().includes(search.toLowerCase()))
    : allMatching;

  const total = filtered.length;
  const paged = filtered.slice(skip, skip + limitNum);

  const stats = { pending: 0, approved: 0, rejected: 0 };
  statusCounts.forEach((s) => {
    if (stats[s._id] !== undefined) stats[s._id] = s.count;
  });

  res.json({
    success: true,
    data: paged,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    stats,
  });
});

// @desc    Approve or reject a regularization request. Approving writes the
//          requested check-in/check-out back onto the underlying Attendance
//          record (creating one, marked present, if none existed).
// @route   PUT /api/attendance-regularizations/:id/review
// @access  Private (admin, hr_manager)
const reviewRegularization = asyncHandler(async (req, res) => {
  const { status, reviewNote } = req.body;

  const request = await AttendanceRegularization.findById(req.params.id);
  if (!request) {
    return res.status(404).json({ success: false, message: "Regularization request not found" });
  }
  if (request.status !== "pending") {
    return res.status(400).json({ success: false, message: `This request has already been ${request.status}` });
  }

  request.status = status;
  request.reviewNote = reviewNote || "";
  request.reviewedBy = req.user._id;
  await request.save();

  if (status === "approved") {
    await Attendance.findOneAndUpdate(
      { employee: request.employee, date: request.date },
      {
        employee: request.employee,
        date: request.date,
        checkIn: request.requestedCheckIn,
        checkOut: request.requestedCheckOut,
        status: "present",
        markedBy: req.user._id,
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  res.json({ success: true, data: request });
});

module.exports = { createRegularization, getRegularizations, reviewRegularization };
