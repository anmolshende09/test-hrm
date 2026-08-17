export const LEAVE_TYPES = [
  { value: "sick", label: "Sick Leave" },
  { value: "casual", label: "Casual Leave" },
  { value: "annual", label: "Annual Leave" },
  { value: "unpaid", label: "Unpaid Leave" },
  { value: "other", label: "Other" },
];

export const LEAVE_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const ATTENDANCE_STATUS = {
  PRESENT: "present",
  ABSENT: "absent",
  HALF_DAY: "half_day",
  ON_LEAVE: "on_leave",
  DAY_OFF: "day_off",
};

// Derived-only statuses shown in the Attendance Matrix — never sent to the
// server, computed there and returned as part of the matrix response.
export const DERIVED_ATTENDANCE_STATUS = {
  HOLIDAY: "holiday",
  FUTURE: "future",
  NOT_ADDED: "not_added",
};

export const EMPLOYEE_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ON_LEAVE: "on_leave",
};

export const CALENDAR_CATEGORIES = [
  { value: "holiday", label: "Holiday" },
  { value: "meeting", label: "Meeting" },
];

export const HOLIDAY_CATEGORIES = [
  { value: "national", label: "National" },
  { value: "company_specific", label: "Company Specific" },
  { value: "religious", label: "Religious" },
];

export const ANNOUNCEMENT_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "policy", label: "Policy" },
  { value: "event", label: "Event" },
  { value: "urgent", label: "Urgent" },
  { value: "celebration", label: "Celebration" },
];

export const ANNOUNCEMENT_PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export const AUDIENCE_TYPES = [
  { value: "company_wide", label: "Company-wide" },
  { value: "branch", label: "Specific Branch(es)" },
  { value: "department", label: "Specific Department(s)" },
];

export const CANDIDATE_SOURCES = [
  { value: "referral", label: "Referral" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "job_board", label: "Job Board" },
  { value: "company_website", label: "Company Website" },
  { value: "walk_in", label: "Walk-in" },
  { value: "other", label: "Other" },
];

export const CANDIDATE_STATUSES = [
  { value: "applied", label: "Applied" },
  { value: "screening", label: "Screening" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
];

export const INTERVIEW_TYPES = [
  { value: "phone", label: "Phone" },
  { value: "video", label: "Video" },
  { value: "in_person", label: "In Person" },
];

export const INTERVIEW_STATUSES = [
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "rescheduled", label: "Rescheduled" },
];

export const OFFER_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
];

// Meetings = Blue, Holidays = Green, Leaves = Orange — per the Calendar spec's legend
export const CALENDAR_CATEGORY_STYLES = {
  meeting: { dot: "bg-primary", bar: "bg-primary/15 text-primary", label: "Meeting" },
  holiday: { dot: "bg-success", bar: "bg-success-soft text-success", label: "Holiday" },
  leave: { dot: "bg-warning", bar: "bg-warning-soft text-warning", label: "Leave" },
};
