const CalendarEvent = require("../models/CalendarEvent");
const LeaveRequest = require("../models/LeaveRequest");
const asyncHandler = require("../utils/asyncHandler");
const { LEAVE_TYPE_LABELS } = require("../constants/leaveTypes");

// @desc    Get all calendar events (holidays, meetings, and approved leaves)
//          whose date range overlaps [from, to]. This is the single call the
//          Calendar page uses, regardless of month/week/day view — the
//          frontend just re-slices the same normalized event list.
// @route   GET /api/calendar?from=&to=
// @access  Private
const getCalendarEvents = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) {
    return res.status(400).json({ success: false, message: "Both 'from' and 'to' query params are required" });
  }
  const rangeStart = new Date(from);
  const rangeEnd = new Date(to);

  const overlapsRange = { startDate: { $lte: rangeEnd }, endDate: { $gte: rangeStart } };

  const [holidaysAndMeetings, approvedLeaves] = await Promise.all([
    CalendarEvent.find(overlapsRange).sort({ startDate: 1 }),
    LeaveRequest.find({ status: "approved", ...overlapsRange }).populate("employee", "name"),
  ]);

  const holidayMeetingEvents = holidaysAndMeetings.map((e) => ({
    _id: e._id,
    title: e.title,
    category: e.category, // 'holiday' | 'meeting'
    holidayCategory: e.holidayCategory || null,
    startDate: e.startDate,
    endDate: e.endDate,
    description: e.description,
  }));

  const leaveEvents = approvedLeaves
    .filter((leave) => leave.employee)
    .map((leave) => ({
      _id: leave._id,
      title: `${leave.employee.name} - ${LEAVE_TYPE_LABELS[leave.leaveType] || leave.leaveType}`,
      category: "leave",
      startDate: leave.startDate,
      endDate: leave.endDate,
      description: leave.reason,
    }));

  const events = [...holidayMeetingEvents, ...leaveEvents].sort(
    (a, b) => new Date(a.startDate) - new Date(b.startDate)
  );

  res.json({ success: true, count: events.length, data: events });
});

// @desc    Create a holiday or meeting event
// @route   POST /api/calendar
// @access  Private (admin, hr_manager)
const createCalendarEvent = asyncHandler(async (req, res) => {
  const { title, category, startDate, endDate, description } = req.body;
  const event = await CalendarEvent.create({
    title,
    category,
    startDate,
    endDate: endDate || startDate,
    description,
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, data: event });
});

// @desc    Update a holiday or meeting event
// @route   PUT /api/calendar/:id
// @access  Private (admin, hr_manager)
const updateCalendarEvent = asyncHandler(async (req, res) => {
  const { title, category, startDate, endDate, description } = req.body;
  const event = await CalendarEvent.findByIdAndUpdate(
    req.params.id,
    { title, category, startDate, endDate, description },
    { new: true, runValidators: true }
  );
  if (!event) {
    return res.status(404).json({ success: false, message: "Calendar event not found" });
  }
  res.json({ success: true, data: event });
});

// @desc    Delete a holiday or meeting event
// @route   DELETE /api/calendar/:id
// @access  Private (admin, hr_manager)
const deleteCalendarEvent = asyncHandler(async (req, res) => {
  const event = await CalendarEvent.findByIdAndDelete(req.params.id);
  if (!event) {
    return res.status(404).json({ success: false, message: "Calendar event not found" });
  }
  res.json({ success: true, message: "Event deleted" });
});

module.exports = { getCalendarEvents, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent };
