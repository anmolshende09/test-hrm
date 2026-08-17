// Source: HRMS_Roles_Module.md spec, sections 8-49 (42 modules).
//
// IMPORTANT — this catalog intentionally does NOT total 606 permissions.
// The spec's own §56 admits the screenshots only captured ~309 of the
// claimed 606; padding this file with invented permissions to hit 606
// would violate the spec's explicit instruction not to invent anything
// unsupported by the source. The UI will show the real total (~309),
// not the aspirational one.
//
// Each permission gets a unique `key` (not slugified from the label) because
// the Users module legitimately repeats "Manage Users" twice per the
// screenshots (§9) — slugifying labels would collide. Display labels are
// preserved exactly as written in the spec, including that duplicate.

const buildModule = (moduleKey, moduleLabel, labels) => ({
  moduleKey,
  moduleLabel,
  permissions: labels.map((label, i) => ({ key: `${moduleKey}.perm_${i}`, label })),
});

const PERMISSION_CATALOG = [
  buildModule("dashboard", "Dashboard", ["Manage Dashboard"]),

  buildModule("users", "Users", [
    "Manage Users",
    "Manage All Users",
    "Manage Own Users",
    "Manage Users", // duplicate preserved exactly as shown in the screenshots
    "Create Users",
    "Edit Users",
    "Delete Users",
    "Reset Password Users",
    "Change Status Users",
  ]),

  buildModule("roles", "Roles", [
    "Manage Roles",
    "Manage All Roles",
    "Manage Own Roles",
    "View Roles",
    "Create Roles",
    "Edit Roles",
    "Delete Roles",
  ]),

  buildModule("branches", "Branches", [
    "Manage Branches",
    "Manage All Branches",
    "Manage Own Branches",
    "View Branches",
    "Create Branches",
    "Edit Branches",
    "Delete Branches",
    "Manage Branch Status",
  ]),

  buildModule("departments", "Departments", [
    "Manage Departments",
    "Manage All Departments",
    "Manage Own Departments",
    "View Departments",
    "Create Departments",
    "Edit Departments",
    "Delete Departments",
    "Manage Departments Status",
  ]),

  buildModule("designations", "Designations", [
    "Manage Designations",
    "Manage All Designations",
    "Manage Own Designations",
    "View Designations",
    "Create Designations",
    "Edit Designations",
    "Delete Designations",
    "Manage Designations Status",
  ]),

  buildModule("document_types", "Document Types", [
    "Manage Document Types",
    "Manage All Document Types",
    "Manage Own Document Types",
    "View Document Types",
    "Create Document Types",
    "Edit Document Types",
    "Delete Document Types",
  ]),

  // Spec says "0 of 12 selected" but the screenshot only shows 8 permissions
  // before being cut off (§15 says so explicitly). Only the 8 visible ones
  // are included — see the catalog-gaps note surfaced to the admin.
  buildModule("employees", "Employees", [
    "Manage Employees",
    "Manage All Employees",
    "Manage Own Employees",
    "View Employees",
    "Create Employees",
    "Edit Employees",
    "Delete Employees",
    "Download Joining Letter",
  ]),

  buildModule("award_types", "Award Types", [
    "Manage Award Types",
    "Manage All Award Types",
    "Manage Own Award Types",
    "View Award Types",
    "Create Award Types",
    "Edit Award Types",
    "Delete Award Types",
  ]),

  buildModule("promotions", "Promotions", [
    "Manage Promotions",
    "Manage All Promotions",
    "Manage Own Promotions",
    "View Promotions",
    "Create Promotions",
    "Edit Promotions",
    "Delete Promotions",
    "Approve Promotions",
    "Reject Promotions",
  ]),

  buildModule("resignations", "Resignations", [
    "Manage Resignations",
    "Manage All Resignations",
    "Manage Own Resignations",
    "View Resignations",
    "Create Resignations",
    "Edit Resignations",
    "Delete Resignations",
    "Approve Resignations",
    "Reject Resignations",
  ]),

  buildModule("terminations", "Terminations", [
    "Manage Terminations",
    "Manage All Terminations",
    "Manage Own Terminations",
    "View Terminations",
    "Create Terminations",
    "Edit Terminations",
    "Delete Terminations",
    "Approve Terminations",
    "Reject Terminations",
  ]),

  // NOTE: this catalog includes "Delete Warnings" per the spec's screenshot,
  // but the live Warning model/routes deliberately have no DELETE endpoint
  // (disciplinary audit integrity — see project memory). The permission
  // *label* can exist in the catalog without a corresponding enforced
  // action; flagging the mismatch rather than silently resolving it.
  buildModule("warnings", "Warnings", [
    "Manage Warnings",
    "Manage All Warnings",
    "Manage Own Warnings",
    "View Warnings",
    "Create Warnings",
    "Edit Warnings",
    "Delete Warnings",
    "Approve Warnings",
    "Acknowledge Warnings",
  ]),

  buildModule("holidays", "Holidays", [
    "Manage Holidays",
    "Manage All Holidays",
    "Manage Own Holidays",
    "View Holidays",
    "Create Holidays",
    "Edit Holidays",
    "Delete Holidays",
  ]),

  buildModule("announcements", "Announcements", [
    "Manage Announcements",
    "Manage All Announcements",
    "Manage Own Announcements",
    "View Announcements",
    "Create Announcements",
    "Edit Announcements",
    "Delete Announcements",
  ]),

  buildModule("asset_types", "Asset Types", [
    "Manage Asset Types",
    "Manage All Asset Types",
    "Manage Own Asset Types",
    "View Asset Types",
    "Create Asset Types",
    "Edit Asset Types",
    "Delete Asset Types",
  ]),

  buildModule("assets", "Assets", [
    "Manage Assets",
    "Manage All Assets",
    "Manage Own Assets",
    "View Assets",
    "Create Assets",
    "Edit Assets",
    "Delete Assets",
    "Assign Assets",
    "Manage Asset Maintenance",
    "Export Assets",
    "Import Assets",
  ]),

  buildModule("training_types", "Training Types", [
    "Manage Training Types",
    "Manage All Training Types",
    "Manage Own Training Types",
    "View Training Types",
    "Create Training Types",
    "Edit Training Types",
    "Delete Training Types",
  ]),

  buildModule("training_programs", "Training Programs", [
    "Manage Training Programs",
    "Manage All Training Programs",
    "Manage Own Training Programs",
    "View Training Programs",
    "Create Training Programs",
    "Edit Training Programs",
    "Delete Training Programs",
  ]),

  buildModule("employee_trainings", "Employee Trainings", [
    "Manage Employee Trainings",
    "Manage All Employee Trainings",
    "Manage Own Employee Trainings",
    "View Employee Trainings",
    "Create Employee Trainings",
    "Edit Employee Trainings",
    "Delete Employee Trainings",
    "Assign Trainings",
    "Manage Assessments",
    "Record Assessment Results",
  ]),

  buildModule("job_categories", "Job Categories", [
    "Manage Job Categories",
    "Manage All Job Categories",
    "Manage Own Job Categories",
    "View Job Categories",
    "Create Job Categories",
    "Edit Job Categories",
    "Delete Job Categories",
  ]),

  buildModule("job_types", "Job Types", [
    "Manage Job Types",
    "Manage All Job Types",
    "Manage Own Job Types",
    "View Job Types",
    "Create Job Types",
    "Edit Job Types",
    "Delete Job Types",
  ]),

  buildModule("candidates", "Candidates", [
    "Manage Candidates",
    "Manage All Candidates",
    "Manage Own Candidates",
    "View Candidates",
    "Edit Candidates",
    "Delete Candidates",
    "Convert to Employee",
  ]),

  buildModule("interviews", "Interviews", [
    "Manage Interviews",
    "Manage All Interviews",
    "Manage Own Interviews",
    "View Interviews",
    "Create Interviews",
    "Edit Interviews",
    "Delete Interviews",
  ]),

  buildModule("offers", "Offers", [
    "Manage Offers",
    "Manage All Offers",
    "Manage Own Offers",
    "View Offers",
    "Create Offers",
    "Edit Offers",
    "Delete Offers",
    "Approve Offers",
  ]),

  buildModule("contract_types", "Contract Types", [
    "Manage Contract Types",
    "Manage All Contract Types",
    "Manage Own Contract Types",
    "View Contract Types",
    "Create Contract Types",
    "Edit Contract Types",
    "Delete Contract Types",
  ]),

  buildModule("employee_contracts", "Employee Contracts", [
    "Manage Employee Contracts",
    "Manage All Employee Contracts",
    "Manage Own Employee Contracts",
    "View Employee Contracts",
    "Create Employee Contracts",
    "Edit Employee Contracts",
    "Delete Employee Contracts",
    "Approve Employee Contracts",
    "Reject Employee Contracts",
  ]),

  buildModule("contract_templates", "Contract Templates", [
    "Manage Contract Templates",
    "Manage All Contract Templates",
    "Manage Own Contract Templates",
    "View Contract Templates",
    "Create Contract Templates",
    "Edit Contract Templates",
    "Delete Contract Templates",
  ]),

  buildModule("document_categories", "Document Categories", [
    "Manage Document Categories",
    "Manage All Document Categories",
    "Manage Own Document Categories",
    "View Document Categories",
    "Create Document Categories",
    "Edit Document Categories",
    "Delete Document Categories",
  ]),

  buildModule("hr_documents", "HR Documents", [
    "Manage HR Documents",
    "Manage All HR Documents",
    "Manage Own HR Documents",
    "View HR Documents",
    "Create HR Documents",
    "Edit HR Documents",
    "Delete HR Documents",
  ]),

  buildModule("document_templates", "Document Templates", [
    "Manage Document Templates",
    "Manage All Document Templates",
    "Manage Own Document Templates",
    "View Document Templates",
    "Create Document Templates",
    "Edit Document Templates",
    "Delete Document Templates",
  ]),

  buildModule("shifts", "Shifts", [
    "Manage Shifts",
    "Manage All Shifts",
    "Manage Own Shifts",
    "View Shifts",
    "Create Shifts",
    "Edit Shifts",
    "Delete Shifts",
  ]),

  buildModule("attendance_policies", "Attendance Policies", [
    "Manage Attendance Policies",
    "Manage All Attendance Policies",
    "Manage Own Attendance Policies",
    "View Attendance Policies",
    "Create Attendance Policies",
    "Edit Attendance Policies",
    "Delete Attendance Policies",
  ]),

  buildModule("attendance_records", "Attendance Records", [
    "Manage Attendance Records",
    "Manage All Attendance Records",
    "Manage Own Attendance Records",
    "View Attendance Records",
    "Create Attendance Records",
    "Edit Attendance Records",
    "Delete Attendance Records",
    "Clock In/Out",
    "Import Attendance Records",
    "Export Attendance Records",
  ]),

  buildModule("attendance_regularizations", "Attendance Regularizations", [
    "Manage Attendance Regularizations",
    "Manage All Attendance Regularizations",
    "Manage Own Attendance Regularizations",
    "View Attendance Regularizations",
    "Create Attendance Regularizations",
    "Edit Attendance Regularizations",
    "Delete Attendance Regularizations",
    "Approve Attendance Regularizations",
    "Reject Attendance Regularizations",
  ]),

  buildModule("salary_components", "Salary Components", [
    "Manage Salary Components",
    "Manage All Salary Components",
    "Manage Own Salary Components",
    "View Salary Components",
    "Create Salary Components",
    "Edit Salary Components",
    "Delete Salary Components",
  ]),

  buildModule("employee_salaries", "Employee Salaries", [
    "Manage Employee Salaries",
    "Manage All Employee Salaries",
    "Manage Own Employee Salaries",
    "View Employee Salaries",
    "Create Employee Salaries",
    "Edit Employee Salaries",
    "Delete Employee Salaries",
  ]),

  buildModule("payroll_runs", "Payroll Runs", [
    "Manage Payroll Runs",
    "Manage All Payroll Runs",
    "Manage Own Payroll Runs",
    "View Payroll Runs",
    "Create Payroll Runs",
    "Edit Payroll Runs",
    "Delete Payroll Runs",
    "Process Payroll Runs",
    "Import Payroll Runs",
    "Export Payroll Runs",
  ]),

  buildModule("payslips", "Payslips", [
    "Manage Payslips",
    "Manage All Payslips",
    "Manage Own Payslips",
    "View Payslips",
    "Create Payslips",
    "Download Payslips",
  ]),

  buildModule("calendar", "Calendar", ["Manage Calendar", "View Calendar"]),

  buildModule("working_days", "Working Days", ["Manage Working Days", "Update Working Days"]),

  buildModule("organization_chart", "Organization Chart", [
    "Manage Organization Chart",
    "Manage All Organization Chart",
    "Manage Own Organization Chart",
  ]),
];

const getTotalPermissionCount = () =>
  PERMISSION_CATALOG.reduce((sum, mod) => sum + mod.permissions.length, 0);

// Validates that a submitted key list only contains real catalog keys —
// used server-side so a role can never be saved with a fabricated permission.
const getAllValidKeys = () => {
  const keys = new Set();
  PERMISSION_CATALOG.forEach((mod) => mod.permissions.forEach((p) => keys.add(p.key)));
  return keys;
};

module.exports = { PERMISSION_CATALOG, getTotalPermissionCount, getAllValidKeys };
