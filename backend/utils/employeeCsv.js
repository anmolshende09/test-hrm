const EMPLOYMENT_TYPE_LABELS = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  intern: "Intern",
};

const STATUS_LABELS = {
  active: "Active",
  inactive: "Inactive",
  on_leave: "On Leave",
  probation: "Probation",
  terminated: "Terminated",
};

// Reverse lookups for import — same case-insensitive pattern as
// attendanceController's CSV_STATUS_LOOKUP.
const EMPLOYMENT_TYPE_LOOKUP = {
  "full-time": "full_time",
  full_time: "full_time",
  "part-time": "part_time",
  part_time: "part_time",
  contract: "contract",
  intern: "intern",
};

const STATUS_LOOKUP = {
  active: "active",
  inactive: "inactive",
  "on leave": "on_leave",
  on_leave: "on_leave",
  probation: "probation",
  terminated: "terminated",
};

const EXPORT_COLUMNS = [
  { label: "Employee ID", value: (e) => e.employeeId },
  { label: "Employee Code", value: (e) => e.employeeCode },
  { label: "Name", value: (e) => e.name },
  { label: "Email", value: (e) => e.email },
  { label: "Phone", value: (e) => e.phone || "" },
  { label: "Department", value: (e) => e.department?.name || "" },
  { label: "Designation", value: (e) => e.designation?.name || "" },
  { label: "Joining Date", value: (e) => (e.joiningDate ? e.joiningDate.toISOString().split("T")[0] : "") },
  { label: "Employment Type", value: (e) => EMPLOYMENT_TYPE_LABELS[e.employmentType] || e.employmentType },
  { label: "Status", value: (e) => STATUS_LABELS[e.status] || e.status },
  { label: "Salary", value: (e) => (e.salary != null ? e.salary : "") },
];

module.exports = { EXPORT_COLUMNS, EMPLOYMENT_TYPE_LOOKUP, STATUS_LOOKUP };
