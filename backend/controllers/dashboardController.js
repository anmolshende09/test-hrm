const Employee = require("../models/Employee");
const Department = require("../models/Department");
const Branch = require("../models/Branch");
const Attendance = require("../models/Attendance");
const LeaveRequest = require("../models/LeaveRequest");
const Announcement = require("../models/Announcement");
const Asset = require("../models/Asset");
const PayrollRun = require("../models/PayrollRun");
const Candidate = require("../models/Candidate");
const asyncHandler = require("../utils/asyncHandler");
const { getAnnouncementAudienceQuery } = require("../utils/audienceFilter");

const startOfDay = (d) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
};

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// @desc    Aggregated dashboard data: stat cards + widgets in a single call
// @route   GET /api/dashboard
// @access  Private
const getDashboard = asyncHandler(async (req, res) => {
  const today = startOfDay(Date.now());
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // today + 6 previous = 7 days

  const announcementAudienceQuery = await getAnnouncementAudienceQuery(req.user);

  const [
    totalEmployees,
    todaysAttendance,
    approvedLeaveToday,
    departmentCounts,
    departments,
    recentLeaves,
    announcements,
    assetStatusCounts,
    candidateStatusCounts,
    branchesCount,
    departmentsCount,
    pendingLeavesCount,
    monthPayrollRuns,
    monthAttendance,
    monthLeaveRequests,
    weekAttendance,
    birthdayEmployees,
    recentCandidates,
  ] = await Promise.all([
    Employee.countDocuments({ status: { $ne: "inactive" } }),
    Attendance.find({ date: today }).populate("employee", "name profilePicture"),
    LeaveRequest.find({
      status: "approved",
      startDate: { $lte: today },
      endDate: { $gte: today },
    }).populate("employee", "name profilePicture"),
    Employee.aggregate([{ $group: { _id: "$department", count: { $sum: 1 } } }]),
    Department.find().lean(),
    LeaveRequest.find().sort({ createdAt: -1 }).limit(5).populate("employee", "name"),
    Announcement.find(announcementAudienceQuery).sort({ featured: -1, startDate: -1 }).limit(5),
    Asset.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Candidate.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Branch.countDocuments(),
    Department.countDocuments(),
    LeaveRequest.countDocuments({ status: "pending" }),
    PayrollRun.find({ status: "completed", payDate: { $gte: monthStart, $lte: monthEnd } }).select("netPay"),
    Attendance.find({ date: { $gte: monthStart, $lte: monthEnd } }).select("status"),
    LeaveRequest.find({ createdAt: { $gte: monthStart, $lte: monthEnd } }).select("status"),
    Attendance.find({ date: { $gte: sevenDaysAgo, $lte: today } }).select("date status"),
    // Birthday match is done in JS below rather than a $month/$dayOfMonth
    // aggregation — the employee list is small enough that a full scan is
    // simpler and avoids timezone edge cases in date-part extraction.
    Employee.find({ status: { $ne: "inactive" }, dateOfBirth: { $ne: null } }).select("name profilePicture dateOfBirth designation"),
    Candidate.find().sort({ createdAt: -1 }).limit(5).select("name job status createdAt"),
  ]);

  const presentToday = todaysAttendance.filter((a) => a.status === "present").length;
  const absentToday = todaysAttendance.filter((a) => a.status === "absent").length;

  // "On Leave Today" is the union of two independent facts:
  //  1. an approved LeaveRequest whose date range covers today, and
  //  2. today's Attendance record explicitly marked as `on_leave`.
  // These are deliberately separate signals in the schema (an employee can be
  // marked on_leave for a day without ever filing a formal request, or have an
  // approved request without anyone marking attendance yet) — `absent` is
  // intentionally NOT included here, since an absence isn't the same fact as
  // being on leave. We dedupe by employee so someone covered by both shows once,
  // preferring the leave request's leaveType when both exist.
  const attendanceOnLeave = todaysAttendance.filter((a) => a.status === "on_leave" && a.employee);

  const onLeaveMap = new Map();
  approvedLeaveToday.forEach((leave) => {
    if (!leave.employee) return;
    onLeaveMap.set(leave.employee._id.toString(), {
      _id: leave._id,
      employee: leave.employee,
      leaveType: leave.leaveType,
      source: "leave_request",
    });
  });
  attendanceOnLeave.forEach((att) => {
    const key = att.employee._id.toString();
    if (!onLeaveMap.has(key)) {
      onLeaveMap.set(key, {
        _id: att._id,
        employee: att.employee,
        leaveType: null,
        source: "attendance",
      });
    }
  });
  const employeesOnLeave = Array.from(onLeaveMap.values());

  const deptMap = departments.reduce((acc, d) => {
    acc[d._id.toString()] = { name: d.name, count: 0 };
    return acc;
  }, {});
  departmentCounts.forEach((c) => {
    const key = c._id ? c._id.toString() : null;
    if (key && deptMap[key]) deptMap[key].count = c.count;
  });

  // --- Asset Status chart ---
  const ASSET_STATUSES = ["available", "assigned", "under_maintenance", "retired"];
  const assetCountMap = new Map(assetStatusCounts.map((c) => [c._id, c.count]));
  const assetStatusDistribution = ASSET_STATUSES.map((status) => ({
    status,
    count: assetCountMap.get(status) || 0,
  }));

  // --- Candidate Pipeline chart ---
  const PIPELINE_STAGES = ["applied", "screening", "interview", "offer", "hired"];
  const candidateCountMap = new Map(candidateStatusCounts.map((c) => [c._id, c.count]));
  const candidatePipeline = PIPELINE_STAGES.map((status) => ({
    status,
    count: candidateCountMap.get(status) || 0,
  }));
  const candidateRejectedCount = candidateCountMap.get("rejected") || 0;

  // --- Payroll This Month card ---
  const payrollThisMonth = {
    netPay: monthPayrollRuns.reduce((sum, r) => sum + (r.netPay || 0), 0),
    runsCompleted: monthPayrollRuns.length,
  };

  // --- Attendance Rate card --- month-to-date: present / (present + absent).
  // On_leave days are excluded from the denominator since they're not a
  // presence/absence outcome to begin with.
  const monthPresent = monthAttendance.filter((a) => a.status === "present").length;
  const monthAbsent = monthAttendance.filter((a) => a.status === "absent").length;
  const attendanceRate = monthPresent + monthAbsent > 0 ? Math.round((monthPresent / (monthPresent + monthAbsent)) * 1000) / 10 : 0;

  // --- Leave Overview donut --- this month's applications by status.
  const leaveOverview = ["approved", "pending", "rejected"].map((status) => ({
    status,
    count: monthLeaveRequests.filter((l) => l.status === status).length,
  }));
  const leaveOverviewTotal = monthLeaveRequests.length;

  // --- Attendance — Last 7 Days stacked bar ---
  const sevenDayBuckets = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    sevenDayBuckets.push({ date: d, label: DAY_LABELS[d.getDay()] });
  }
  const attendanceLast7Days = sevenDayBuckets.map(({ date, label }) => {
    const dayRecords = weekAttendance.filter((a) => startOfDay(a.date).getTime() === date.getTime());
    return {
      label,
      present: dayRecords.filter((a) => a.status === "present").length,
      absent: dayRecords.filter((a) => a.status === "absent").length,
      onLeave: dayRecords.filter((a) => a.status === "on_leave").length,
    };
  });

  // --- Today's Birthdays --- month/day match, ignoring year.
  const todaysBirthdays = birthdayEmployees
    .filter((e) => {
      const dob = new Date(e.dateOfBirth);
      return dob.getMonth() === today.getMonth() && dob.getDate() === today.getDate();
    })
    .map((e) => ({ _id: e._id, name: e.name, profilePicture: e.profilePicture }));

  res.json({
    success: true,
    data: {
      cards: {
        totalEmployees,
        presentToday,
        absentToday,
        onLeaveToday: employeesOnLeave.length,
        payrollThisMonth,
        attendanceRate,
        branchesCount,
        departmentsCount,
        pendingLeavesCount,
      },
      departmentDistribution: Object.values(deptMap),
      employeesOnLeave,
      recentLeaveRequests: recentLeaves,
      announcements,
      assetStatusDistribution,
      candidatePipeline,
      candidateRejectedCount,
      leaveOverview,
      leaveOverviewTotal,
      attendanceLast7Days,
      todaysBirthdays,
      recentCandidates,
    },
  });
});

// Distinct years present in the data, so the year selector never offers a
// year with nothing in it. Falls back to the current year if there's no
// data at all yet.
const getAvailableYears = async (Model, dateField) => {
  const years = await Model.aggregate([{ $group: { _id: { $year: `$${dateField}` } } }, { $sort: { _id: -1 } }]);
  const list = years.map((y) => y._id).filter(Boolean);
  return list.length > 0 ? list : [new Date().getFullYear()];
};

// @desc    Hiring Trend chart, one year at a time — separate endpoint so the
//          year selector can refetch just this widget, not the whole page.
// @route   GET /api/dashboard/hiring-trend?year=YYYY
// @access  Private
const getHiringTrend = asyncHandler(async (req, res) => {
  const year = parseInt(req.query.year, 10) || new Date().getFullYear();

  const [candidates, availableYears] = await Promise.all([
    Candidate.find({
      appliedDate: { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31, 23, 59, 59, 999) },
    }).select("appliedDate convertedToEmployee"),
    getAvailableYears(Candidate, "appliedDate"),
  ]);

  const months = MONTH_LABELS.map((label, monthIndex) => {
    const inMonth = candidates.filter((c) => new Date(c.appliedDate).getMonth() === monthIndex);
    return { label, applied: inMonth.length, hired: inMonth.filter((c) => c.convertedToEmployee).length };
  });

  res.json({
    success: true,
    data: { year, months, total: candidates.length, availableYears },
  });
});

// @desc    Payroll Trend chart, one year at a time.
// @route   GET /api/dashboard/payroll-trend?year=YYYY
// @access  Private
const getPayrollTrend = asyncHandler(async (req, res) => {
  const year = parseInt(req.query.year, 10) || new Date().getFullYear();

  // Only "completed" runs have real financial aggregates — draft/processing/
  // cancelled runs default their totals to 0.
  const [runs, availableYears] = await Promise.all([
    PayrollRun.find({
      status: "completed",
      payDate: { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31, 23, 59, 59, 999) },
    }).select("payDate netPay"),
    getAvailableYears(PayrollRun, "payDate"),
  ]);

  const months = MONTH_LABELS.map((label, monthIndex) => {
    const inMonth = runs.filter((r) => new Date(r.payDate).getMonth() === monthIndex);
    return { label, netPay: inMonth.reduce((sum, r) => sum + (r.netPay || 0), 0) };
  });

  res.json({
    success: true,
    data: { year, months, total: runs.reduce((sum, r) => sum + (r.netPay || 0), 0), availableYears },
  });
});

module.exports = { getDashboard, getHiringTrend, getPayrollTrend };
