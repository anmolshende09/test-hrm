const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const CalendarEvent = require("../models/CalendarEvent");
const asyncHandler = require("../utils/asyncHandler");
const { toCSV, parseCSV } = require("../utils/csv");

const STATUS_LABELS = {
  present: "Present",
  absent: "Absent",
  half_day: "Half Day",
  on_leave: "Leave",
  day_off: "Day Off",
  holiday: "Holiday",
  future: "Future",
  not_added: "Attendance Not Added",
};

const CSV_STATUS_LOOKUP = {
  present: "present",
  absent: "absent",
  "half day": "half_day",
  half_day: "half_day",
  leave: "on_leave",
  on_leave: "on_leave",
  "day off": "day_off",
  day_off: "day_off",
};

const startOfDay = (d) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
};

// @desc    Mark attendance for an employee on a given date (present/absent/etc.)
//          Upserts so re-marking the same day updates the existing record.
// @route   POST /api/attendance
// @access  Private (admin, hr_manager); employees may mark their own if enabled
const markAttendance = asyncHandler(async (req, res) => {
  const { employee, date, status, remarks } = req.body;
  const day = startOfDay(date || Date.now());

  const record = await Attendance.findOneAndUpdate(
    { employee, date: day },
    { employee, date: day, status, remarks, markedBy: req.user._id },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  res.status(201).json({ success: true, data: record });
});

// @desc    Get attendance history for an employee (or the logged-in employee)
// @route   GET /api/attendance/history/:employeeId?from=&to=
// @access  Private
const getHistory = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;
  const { from, to } = req.query;

  const query = { employee: employeeId };
  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = startOfDay(from);
    if (to) query.date.$lte = startOfDay(to);
  }

  const records = await Attendance.find(query).sort({ date: -1 });
  res.json({ success: true, count: records.length, data: records });
});

// @desc    Get today's attendance across all employees (dashboard summary)
// @route   GET /api/attendance/today
// @access  Private (admin, hr_manager)
const getToday = asyncHandler(async (req, res) => {
  const today = startOfDay(Date.now());
  const totalEmployees = await Employee.countDocuments({ status: { $ne: "inactive" } });

  const records = await Attendance.find({ date: today }).populate("employee", "name employeeId department");

  const present = records.filter((r) => r.status === "present").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const onLeave = records.filter((r) => r.status === "on_leave").length;

  res.json({
    success: true,
    data: {
      date: today,
      totalEmployees,
      present,
      absent,
      onLeave,
      unmarked: Math.max(totalEmployees - records.length, 0),
      records,
    },
  });
});

// @desc    Get attendance percentage for an employee over a date range
// @route   GET /api/attendance/percentage/:employeeId?from=&to=
// @access  Private
const getPercentage = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;
  const { from, to } = req.query;

  const query = { employee: employeeId };
  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = startOfDay(from);
    if (to) query.date.$lte = startOfDay(to);
  }

  const records = await Attendance.find(query);
  const total = records.length;
  const presentCount = records.filter((r) => r.status === "present").length;
  const percentage = total > 0 ? Math.round((presentCount / total) * 10000) / 100 : 0;

  res.json({ success: true, data: { totalDays: total, presentDays: presentCount, percentage } });
});

// @desc    Daily/Monthly attendance matrix: every employee x every day of the
//          month, with Holiday/Future/Attendance-Not-Added derived at query
//          time (not stored — see the model's status field comment).
// @route   GET /api/attendance/matrix?year=&month=&employee=&department=
// @access  Private (admin, hr_manager)
const getMatrix = asyncHandler(async (req, res) => {
  const { year, month, employee, department } = req.query;
  const y = parseInt(year, 10) || new Date().getFullYear();
  const m = parseInt(month, 10) || new Date().getMonth() + 1; // 1-indexed

  const empQuery = {};
  if (employee) empQuery._id = employee;
  if (department) empQuery.department = department;

  const employees = await Employee.find(empQuery)
    .select("name employeeId department")
    .populate("department", "name")
    .sort({ name: 1 });

  const monthStart = new Date(y, m - 1, 1);
  const monthEnd = new Date(y, m, 0);
  const numDays = monthEnd.getDate();
  const employeeIds = employees.map((e) => e._id);

  const [records, holidays] = await Promise.all([
    Attendance.find({ employee: { $in: employeeIds }, date: { $gte: monthStart, $lte: monthEnd } }),
    CalendarEvent.find({
      category: "holiday",
      startDate: { $lte: monthEnd },
      endDate: { $gte: monthStart },
    }),
  ]);

  const recordMap = new Map();
  records.forEach((r) => {
    recordMap.set(`${r.employee.toString()}_${r.date.toISOString().split("T")[0]}`, r.status);
  });

  const holidayDates = new Set();
  holidays.forEach((h) => {
    const cursor = new Date(Math.max(h.startDate, monthStart));
    const end = new Date(Math.min(h.endDate, monthEnd));
    while (cursor <= end) {
      holidayDates.add(cursor.toISOString().split("T")[0]);
      cursor.setDate(cursor.getDate() + 1);
    }
  });

  const today = startOfDay(Date.now());

  const matrix = employees.map((emp) => {
    const days = [];
    for (let d = 1; d <= numDays; d += 1) {
      const date = new Date(y, m - 1, d);
      const dateKey = date.toISOString().split("T")[0];
      const key = `${emp._id.toString()}_${dateKey}`;

      let status;
      if (recordMap.has(key)) {
        status = recordMap.get(key);
      } else if (holidayDates.has(dateKey)) {
        status = "holiday";
      } else if (date > today) {
        status = "future";
      } else {
        status = "not_added";
      }
      days.push({ date: dateKey, status, label: STATUS_LABELS[status] });
    }
    return {
      employee: { _id: emp._id, name: emp.name, employeeId: emp.employeeId, department: emp.department?.name || null },
      days,
    };
  });

  res.json({ success: true, data: { year: y, month: m, numDays, matrix } });
});

// @desc    Monthly attendance summary — aggregate counts per employee
// @route   GET /api/attendance/summary?year=&month=&employee=&department=
// @access  Private (admin, hr_manager)
const getSummary = asyncHandler(async (req, res) => {
  const { year, month, employee, department } = req.query;
  const y = parseInt(year, 10) || new Date().getFullYear();
  const m = parseInt(month, 10) || new Date().getMonth() + 1;

  const empQuery = {};
  if (employee) empQuery._id = employee;
  if (department) empQuery.department = department;

  const employees = await Employee.find(empQuery).select("name employeeId");
  const employeeIds = employees.map((e) => e._id);
  const monthStart = new Date(y, m - 1, 1);
  const monthEnd = new Date(y, m, 0);

  const records = await Attendance.find({ employee: { $in: employeeIds }, date: { $gte: monthStart, $lte: monthEnd } });

  const summary = employees.map((emp) => {
    const empRecords = records.filter((r) => r.employee.toString() === emp._id.toString());
    const counts = { present: 0, absent: 0, half_day: 0, on_leave: 0, day_off: 0 };
    empRecords.forEach((r) => {
      if (counts[r.status] !== undefined) counts[r.status] += 1;
    });
    const totalMarked = empRecords.length;
    const percentage = totalMarked > 0 ? Math.round((counts.present / totalMarked) * 10000) / 100 : 0;
    return {
      employee: { _id: emp._id, name: emp.name, employeeId: emp.employeeId },
      ...counts,
      totalMarked,
      percentage,
    };
  });

  res.json({ success: true, data: summary });
});

// @desc    Export attendance records for a month as CSV
// @route   GET /api/attendance/export?year=&month=&employee=&department=
// @access  Private (admin, hr_manager)
const exportAttendance = asyncHandler(async (req, res) => {
  const { year, month, employee, department } = req.query;
  const y = parseInt(year, 10) || new Date().getFullYear();
  const m = parseInt(month, 10) || new Date().getMonth() + 1;

  const empQuery = {};
  if (employee) empQuery._id = employee;
  if (department) empQuery.department = department;
  const employeeIds = (await Employee.find(empQuery).select("_id")).map((e) => e._id);

  const monthStart = new Date(y, m - 1, 1);
  const monthEnd = new Date(y, m, 0);

  const records = await Attendance.find({ employee: { $in: employeeIds }, date: { $gte: monthStart, $lte: monthEnd } })
    .populate("employee", "name employeeId")
    .sort({ date: 1 });

  const csv = toCSV(records, [
    { label: "Employee ID", value: (r) => r.employee?.employeeId || "" },
    { label: "Employee Name", value: (r) => r.employee?.name || "" },
    { label: "Date", value: (r) => r.date.toISOString().split("T")[0] },
    { label: "Status", value: (r) => STATUS_LABELS[r.status] || r.status },
    { label: "Remarks", value: (r) => r.remarks || "" },
  ]);

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="attendance-${y}-${String(m).padStart(2, "0")}.csv"`);
  res.send(csv);
});

// @desc    Import attendance records from a CSV file. Expected columns:
//          Employee ID, Date, Status, Remarks (Status: Present/Absent/
//          Half Day/Leave/Day Off, case-insensitive). Upserts per row using
//          the same (employee, date) upsert semantics as markAttendance.
// @route   POST /api/attendance/import
// @access  Private (admin, hr_manager)
const importAttendance = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No CSV file uploaded" });
  }

  const text = req.file.buffer.toString("utf-8");
  const rows = parseCSV(text);

  let created = 0;
  let skipped = 0;
  const errors = [];

  for (const row of rows) {
    const employeeId = row["Employee ID"] || row["employeeId"] || row["Employee Id"];
    const dateStr = row["Date"] || row["date"];
    const statusRaw = (row["Status"] || row["status"] || "").toLowerCase().trim();
    const remarks = row["Remarks"] || row["remarks"] || "";
    const status = CSV_STATUS_LOOKUP[statusRaw];

    if (!employeeId || !dateStr || !status) {
      skipped += 1;
      errors.push(`Skipped row with missing/invalid data: ${JSON.stringify(row)}`);
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      skipped += 1;
      errors.push(`No employee found with ID "${employeeId}"`);
      continue;
    }

    const day = startOfDay(dateStr);
    // eslint-disable-next-line no-await-in-loop
    await Attendance.findOneAndUpdate(
      { employee: employee._id, date: day },
      { employee: employee._id, date: day, status, remarks, markedBy: req.user._id },
      { upsert: true, setDefaultsOnInsert: true }
    );
    created += 1;
  }

  res.json({ success: true, data: { created, skipped, errors: errors.slice(0, 20) } });
});

module.exports = {
  markAttendance,
  getHistory,
  getToday,
  getPercentage,
  getMatrix,
  getSummary,
  exportAttendance,
  importAttendance,
};
