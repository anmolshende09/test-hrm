// Mirrors frontend/src/constants/options.js LEAVE_TYPES — kept in sync manually
// since each app only needs a small, stable enum. If this drifts, the calendar
// event title (built in calendarController) will just fall back to the raw
// leaveType value, so nothing breaks — the labels just look nicer.
const LEAVE_TYPE_LABELS = {
  sick: "Sick Leave",
  casual: "Casual Leave",
  annual: "Annual Leave",
  unpaid: "Unpaid Leave",
  other: "Other",
};

module.exports = { LEAVE_TYPE_LABELS };
