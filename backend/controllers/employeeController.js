const path = require("path");
const fs = require("fs");
const Employee = require("../models/Employee");
const EmployeeDocument = require("../models/EmployeeDocument");
const Department = require("../models/Department");
const Designation = require("../models/Designation");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { toCSV, parseCSV } = require("../utils/csv");
const { EXPORT_COLUMNS, EMPLOYMENT_TYPE_LOOKUP, STATUS_LOOKUP } = require("../utils/employeeCsv");
const { generateEmployeeCertificate } = require("../utils/certificateGenerator");

const POPULATE = [
  { path: "department", select: "name" },
  { path: "designation", select: "name" },
  { path: "shift", select: "name startTime endTime" },
  { path: "attendancePolicy", select: "name type" },
  { path: "manager", select: "name" },
];

// multipart/form-data always sends "manager"/"shift"/"attendancePolicy" as
// strings, even when the person picked "None" in the select — Mongoose
// would otherwise try to cast "" to an ObjectId and fail validation, so
// normalize all three to null.
const normalizeOptionalRefs = (payload) => {
  ["manager", "shift", "attendancePolicy"].forEach((key) => {
    if (payload[key] === "" || payload[key] === undefined) {
      payload[key] = null;
    }
  });
  return payload;
};

// contact/banking arrive as JSON-stringified fields in multipart requests
// (nested objects can't be sent as bracket-notation form fields through
// multer the way qs parses urlencoded bodies) — parse them here, once.
const parseJsonField = (raw) => {
  if (!raw) return undefined;
  if (typeof raw === "object") return raw; // already parsed (e.g. JSON request, not multipart)
  try {
    return JSON.parse(raw);
  } catch {
    return null; // signals "invalid JSON" to the caller
  }
};

// §6.2 — sequential EMP000001-style IDs. Simple findOne-sort-increment
// rather than a dedicated counters collection; this has a known (low-risk)
// race condition under concurrent creates, acceptable for an HR onboarding
// action rather than a high-throughput write path.
const generateEmployeeId = async () => {
  const last = await Employee.findOne().sort({ createdAt: -1 }).select("employeeId");
  let nextNum = 1;
  if (last?.employeeId) {
    const match = last.employeeId.match(/(\d+)$/);
    if (match) nextNum = parseInt(match[1], 10) + 1;
  }
  return `EMP${String(nextNum).padStart(6, "0")}`;
};

// @desc    Create an employee — also provisions the linked login account
//          (role is always "employee", never client-supplied).
// @route   POST /api/employees
// @access  Private (admin, hr_manager)
const createEmployee = asyncHandler(async (req, res) => {
  const payload = normalizeOptionalRefs({ ...req.body });
  const { password, contact, banking, employeeId: _ignoredClientId, ...employeeFields } = payload;

  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
  }

  const [existingEmployee, existingUser] = await Promise.all([
    Employee.findOne({ email: employeeFields.email }),
    User.findOne({ email: employeeFields.email }),
  ]);
  if (existingEmployee || existingUser) {
    return res.status(400).json({ success: false, message: "An account with this email already exists" });
  }

  const parsedContact = parseJsonField(contact);
  if (parsedContact === null) {
    return res.status(400).json({ success: false, message: "Invalid contact data" });
  }
  const parsedBanking = parseJsonField(banking);
  if (parsedBanking === null) {
    return res.status(400).json({ success: false, message: "Invalid banking data" });
  }
  if (parsedContact) employeeFields.contact = parsedContact;
  if (parsedBanking) employeeFields.banking = parsedBanking;

  // §15's required-field matrix applies to these sub-fields too — the
  // wizard enforces it client-side, but per Rule "never rely solely on
  // frontend validation" this re-checks server-side before creating anything.
  const contactMissing = ["addressLine1", "city", "state", "country", "postalCode"].filter(
    (k) => !parsedContact?.[k]
  );
  const emergencyMissing = ["name", "relationship", "phone"].filter((k) => !parsedContact?.emergencyContact?.[k]);
  const bankingMissing = ["bankName", "accountHolderName", "accountNumber", "bic", "bankBranch"].filter(
    (k) => !parsedBanking?.[k]
  );
  if (contactMissing.length || emergencyMissing.length || bankingMissing.length) {
    return res.status(400).json({
      success: false,
      message: "Missing required contact/emergency-contact/banking fields",
      missing: { contact: contactMissing, emergencyContact: emergencyMissing, banking: bankingMissing },
    });
  }

  if (req.file) {
    employeeFields.profilePicture = `/uploads/employees/${req.file.filename}`;
  } else {
    return res.status(400).json({ success: false, message: "Profile image is required" });
  }

  employeeFields.employeeId = await generateEmployeeId();

  const employee = await Employee.create(employeeFields);

  // Manual rollback rather than a Mongo transaction (no replica-set
  // dependency) — if the login account can't be created, the Employee
  // record it would have been paired with is removed too.
  try {
    await User.create({ name: employeeFields.name, email: employeeFields.email, password, role: "employee", employee: employee._id });
  } catch (err) {
    await Employee.findByIdAndDelete(employee._id);
    return res.status(400).json({ success: false, message: `Couldn't create the employee's login account: ${err.message}` });
  }

  const populated = await employee.populate(POPULATE);
  res.status(201).json({ success: true, data: populated });
});

// @desc    Get employees with search + pagination + filters
// @route   GET /api/employees?search=&branch=&department=&designation=&status=&page=&limit=
// @access  Private
const getEmployees = asyncHandler(async (req, res) => {
  const { search, branch, department, designation, status, page = 1, limit = 10 } = req.query;

  const query = {};
  if (search) query.$text = { $search: search };
  if (department) {
    query.department = department;
  } else if (branch) {
    const deptIds = (await Department.find({ branch }).select("_id")).map((d) => d._id);
    query.department = { $in: deptIds };
  }
  if (designation) query.designation = designation;
  if (status) query.status = status;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [employees, total] = await Promise.all([
    Employee.find(query).populate(POPULATE).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    Employee.countDocuments(query),
  ]);

  // Login Status is a User-model concept, not an Employee field — attach it
  // per row without changing the Employee schema/response shape elsewhere.
  const employeeIds = employees.map((e) => e._id);
  const linkedUsers = await User.find({ employee: { $in: employeeIds } }).select("employee isActive");
  const loginStatusMap = new Map(linkedUsers.map((u) => [u.employee.toString(), u.isActive]));
  const withLoginStatus = employees.map((e) => ({
    ...e.toObject(),
    loginActive: loginStatusMap.has(e._id.toString()) ? loginStatusMap.get(e._id.toString()) : null,
  }));

  res.json({
    success: true,
    data: withLoginStatus,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

// §1.3 — status tab counts, respecting the current search/branch/department/
// designation filters but not the status filter itself, so every tab stays
// accurate regardless of which one is currently selected.
// @route   GET /api/employees/status-counts
// @access  Private
const getEmployeeStatusCounts = asyncHandler(async (req, res) => {
  const { search, branch, department, designation } = req.query;

  const baseQuery = {};
  if (search) baseQuery.$text = { $search: search };
  if (department) {
    baseQuery.department = department;
  } else if (branch) {
    const deptIds = (await Department.find({ branch }).select("_id")).map((d) => d._id);
    baseQuery.department = { $in: deptIds };
  }
  if (designation) baseQuery.designation = designation;

  const statuses = ["active", "inactive", "probation", "terminated"];
  const [total, ...counts] = await Promise.all([
    Employee.countDocuments(baseQuery),
    ...statuses.map((s) => Employee.countDocuments({ ...baseQuery, status: s })),
  ]);

  const data = { all: total };
  statuses.forEach((s, i) => {
    data[s] = counts[i];
  });
  res.json({ success: true, data });
});

// @desc    Get every employee in a flat, lightweight shape for building the
//          Org Chart tree client-side (and for populating "Reports To"
//          dropdowns). Registered before /:id in the router so "org-chart"
//          isn't swallowed as an :id param.
// @route   GET /api/employees/org-chart
// @access  Private
const getOrgChart = asyncHandler(async (req, res) => {
  const employees = await Employee.find()
    .select("name designation status profilePicture department manager")
    .populate("department", "name")
    .populate("designation", "name")
    .lean();

  res.json({
    success: true,
    count: employees.length,
    data: employees.map((e) => ({
      _id: e._id,
      name: e.name,
      designation: e.designation?.name || null,
      department: e.department?.name || null,
      status: e.status,
      profilePicture: e.profilePicture,
      manager: e.manager ? e.manager.toString() : null,
    })),
  });
});

// @desc    Export the current employee list/filter as CSV
// @route   GET /api/employees/export?search=&branch=&department=&designation=&status=
// @access  Private (admin, hr_manager)
const exportEmployees = asyncHandler(async (req, res) => {
  const { search, branch, department, designation, status } = req.query;

  const query = {};
  if (search) query.$text = { $search: search };
  if (department) {
    query.department = department;
  } else if (branch) {
    const deptIds = (await Department.find({ branch }).select("_id")).map((d) => d._id);
    query.department = { $in: deptIds };
  }
  if (designation) query.designation = designation;
  if (status) query.status = status;

  const employees = await Employee.find(query).populate("department", "name").populate("designation", "name").sort({ name: 1 });
  const csv = toCSV(employees, EXPORT_COLUMNS);

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="employees-${new Date().toISOString().split("T")[0]}.csv"`);
  res.send(csv);
});

// @desc    Bulk-import employees from CSV. Expected columns: Name, Email,
//          Employee Code, Department, Designation, Joining Date, and
//          optionally Phone, Employment Type, Status, Salary. Does NOT
//          create login accounts (no password column) — imported employees
//          get an Employee record only; a login can be added later via the
//          normal edit flow if needed. Same upsert-with-error-collection
//          shape as attendanceController.importAttendance.
// @route   POST /api/employees/import
// @access  Private (admin, hr_manager)
const importEmployees = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No CSV file uploaded" });
  }

  const text = req.file.buffer.toString("utf-8");
  const rows = parseCSV(text);

  let created = 0;
  let skipped = 0;
  const errors = [];

  for (const row of rows) {
    const name = row["Name"] || row["name"];
    const email = row["Email"] || row["email"];
    const employeeCode = row["Employee Code"] || row["employeeCode"];
    const departmentName = row["Department"] || row["department"];
    const designationName = row["Designation"] || row["designation"];
    const joiningDateStr = row["Joining Date"] || row["joiningDate"];
    const phone = row["Phone"] || row["phone"] || "";
    const employmentTypeRaw = (row["Employment Type"] || row["employmentType"] || "full-time").toLowerCase().trim();
    const statusRaw = (row["Status"] || row["status"] || "active").toLowerCase().trim();
    const salaryStr = row["Salary"] || row["salary"] || "";

    if (!name || !email || !employeeCode || !departmentName || !designationName || !joiningDateStr) {
      skipped += 1;
      errors.push(`Skipped row with missing required data: ${JSON.stringify(row)}`);
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const department = await Department.findOne({ name: departmentName });
    if (!department) {
      skipped += 1;
      errors.push(`No department found named "${departmentName}"`);
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const designation = await Designation.findOne({ name: designationName, department: department._id });
    if (!designation) {
      skipped += 1;
      errors.push(`No designation "${designationName}" found in department "${departmentName}"`);
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const duplicate = await Employee.findOne({ $or: [{ email }, { employeeCode }] });
    if (duplicate) {
      skipped += 1;
      errors.push(`Employee with email "${email}" or code "${employeeCode}" already exists`);
      continue;
    }

    const employmentType = EMPLOYMENT_TYPE_LOOKUP[employmentTypeRaw] || "full_time";
    const status = STATUS_LOOKUP[statusRaw] || "active";

    try {
      // eslint-disable-next-line no-await-in-loop
      const employeeId = await generateEmployeeId();
      // eslint-disable-next-line no-await-in-loop
      await Employee.create({
        employeeId,
        employeeCode,
        name,
        email,
        phone,
        department: department._id,
        designation: designation._id,
        joiningDate: new Date(joiningDateStr),
        employmentType,
        status,
        salary: salaryStr ? Number(salaryStr) : null,
      });
      created += 1;
    } catch (err) {
      skipped += 1;
      errors.push(`Row for "${email}": ${err.message}`);
    }
  }

  res.json({ success: true, data: { created, skipped, errors: errors.slice(0, 20) } });
});

// @desc    Get a single employee
// @route   GET /api/employees/:id
// @access  Private
const getEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id).populate(POPULATE);
  if (!employee) {
    return res.status(404).json({ success: false, message: "Employee not found" });
  }
  const linkedUser = await User.findOne({ employee: employee._id }).select("isActive");
  res.json({ success: true, data: { ...employee.toObject(), loginActive: linkedUser ? linkedUser.isActive : null } });
});

// @desc    Update an employee
// @route   PUT /api/employees/:id
// @access  Private (admin, hr_manager)
const updateEmployee = asyncHandler(async (req, res) => {
  const payload = normalizeOptionalRefs({ ...req.body });
  const { contact, banking, password: _ignoredPassword, employeeId: _ignoredId, ...employeeFields } = payload;

  const parsedContact = parseJsonField(contact);
  if (parsedContact === null) {
    return res.status(400).json({ success: false, message: "Invalid contact data" });
  }
  const parsedBanking = parseJsonField(banking);
  if (parsedBanking === null) {
    return res.status(400).json({ success: false, message: "Invalid banking data" });
  }
  if (parsedContact) employeeFields.contact = parsedContact;
  if (parsedBanking) employeeFields.banking = parsedBanking;

  if (req.file) {
    employeeFields.profilePicture = `/uploads/employees/${req.file.filename}`;
  }

  if (employeeFields.manager && employeeFields.manager === req.params.id) {
    return res.status(400).json({ success: false, message: "An employee can't be their own manager" });
  }

  if (employeeFields.email) {
    const duplicate = await Employee.findOne({ email: employeeFields.email, _id: { $ne: req.params.id } });
    if (duplicate) {
      return res.status(400).json({ success: false, message: "Another employee already uses this email" });
    }
  }

  const employee = await Employee.findByIdAndUpdate(req.params.id, employeeFields, { new: true, runValidators: true }).populate(POPULATE);
  if (!employee) {
    return res.status(404).json({ success: false, message: "Employee not found" });
  }

  // Keep the linked login account's email in sync — a mismatch here would
  // silently break that person's login.
  if (employeeFields.email) {
    const linkedUser = await User.findOne({ employee: employee._id });
    if (linkedUser && linkedUser.email !== employeeFields.email) {
      const userEmailTaken = await User.findOne({ email: employeeFields.email, _id: { $ne: linkedUser._id } });
      if (!userEmailTaken) {
        linkedUser.email = employeeFields.email;
        await linkedUser.save();
      }
    }
  }

  res.json({ success: true, data: employee });
});

// §3.3 — admin-initiated password reset for an employee's login account.
// Reuses the exact same "assign plaintext, let the pre-save hook hash it"
// pattern as userController.updateUserPassword.
// @route   PUT /api/employees/:id/password
// @access  Private (admin, hr_manager)
const changeEmployeePassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
  }

  const user = await User.findOne({ employee: req.params.id }).select("+password");
  if (!user) {
    return res.status(404).json({ success: false, message: "This employee has no login account" });
  }

  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: "Password updated" });
});

// §3.4/§2.7 — Login Status only. Employee Status (employment state) is a
// completely separate field on Employee and is untouched here.
// @route   PUT /api/employees/:id/login-status
// @access  Private (admin, hr_manager)
const toggleEmployeeLoginStatus = asyncHandler(async (req, res) => {
  const user = await User.findOne({ employee: req.params.id });
  if (!user) {
    return res.status(404).json({ success: false, message: "This employee has no login account" });
  }
  if (String(user._id) === String(req.user._id)) {
    return res.status(400).json({ success: false, message: "You can't lock your own account" });
  }

  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, data: { loginActive: user.isActive } });
});

// @desc    Delete an employee — cascades to their login account and any
//          uploaded employee documents (and the underlying files).
// @route   DELETE /api/employees/:id
// @access  Private (admin)
const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findByIdAndDelete(req.params.id);
  if (!employee) {
    return res.status(404).json({ success: false, message: "Employee not found" });
  }

  // Anyone who reported to the deleted employee becomes a root node rather
  // than pointing at a manager that no longer exists.
  await Employee.updateMany({ manager: req.params.id }, { manager: null });
  await User.deleteOne({ employee: req.params.id });

  const docs = await EmployeeDocument.find({ employee: req.params.id });
  await EmployeeDocument.deleteMany({ employee: req.params.id });
  docs.forEach((d) => fs.unlink(path.join(__dirname, "..", d.filePath), () => {}));

  if (employee.profilePicture) {
    fs.unlink(path.join(__dirname, "..", employee.profilePicture), () => {});
  }

  res.json({ success: true, message: "Employee deleted" });
});

// ---- Documents (§4.8/§18) ----

// @route   GET /api/employees/:id/documents
const getEmployeeDocuments = asyncHandler(async (req, res) => {
  const docs = await EmployeeDocument.find({ employee: req.params.id })
    .populate("documentType", "name required")
    .populate("verifiedBy", "name")
    .populate("uploadedBy", "name")
    .sort({ createdAt: -1 });
  res.json({ success: true, data: docs });
});

// @route   POST /api/employees/:id/documents
const uploadEmployeeDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "A file is required" });
  }
  const { documentType, expiryDate } = req.body;
  if (!documentType) {
    return res.status(400).json({ success: false, message: "Document type is required" });
  }

  const doc = await EmployeeDocument.create({
    employee: req.params.id,
    documentType,
    fileName: req.file.originalname,
    filePath: `/uploads/employee-documents/${req.file.filename}`,
    fileType: path.extname(req.file.originalname).replace(".", "").toUpperCase(),
    fileSize: req.file.size,
    expiryDate: expiryDate || null,
    uploadedBy: req.user._id,
  });

  const populated = await doc.populate("documentType", "name required");
  res.status(201).json({ success: true, data: populated });
});

// @route   PUT /api/employees/:id/documents/:docId/verify
const verifyEmployeeDocument = asyncHandler(async (req, res) => {
  const doc = await EmployeeDocument.findOneAndUpdate(
    { _id: req.params.docId, employee: req.params.id },
    { verified: true, verifiedBy: req.user._id, verifiedAt: new Date() },
    { new: true }
  )
    .populate("documentType", "name required")
    .populate("verifiedBy", "name");

  if (!doc) {
    return res.status(404).json({ success: false, message: "Document not found" });
  }
  res.json({ success: true, data: doc });
});

// @route   DELETE /api/employees/:id/documents/:docId
const deleteEmployeeDocument = asyncHandler(async (req, res) => {
  const doc = await EmployeeDocument.findOneAndDelete({ _id: req.params.docId, employee: req.params.id });
  if (!doc) {
    return res.status(404).json({ success: false, message: "Document not found" });
  }
  fs.unlink(path.join(__dirname, "..", doc.filePath), () => {});
  res.json({ success: true, message: "Document deleted" });
});

// ---- Certifications (§4.7/§19) ----

// @route   GET /api/employees/:id/certificates/:type
//          type: joining_letter | experience_certificate | noc
const downloadEmployeeCertificate = asyncHandler(async (req, res) => {
  const { type } = req.params;
  if (!["joining_letter", "experience_certificate", "noc"].includes(type)) {
    return res.status(400).json({ success: false, message: "Invalid certificate type" });
  }

  const employee = await Employee.findById(req.params.id).populate("department", "name").populate("designation", "name");
  if (!employee) {
    return res.status(404).json({ success: false, message: "Employee not found" });
  }

  const doc = generateEmployeeCertificate(type, employee);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${type}-${employee.employeeId}.pdf"`);
  doc.pipe(res);
  doc.end();
});

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeStatusCounts,
  getOrgChart,
  exportEmployees,
  importEmployees,
  getEmployee,
  updateEmployee,
  changeEmployeePassword,
  toggleEmployeeLoginStatus,
  deleteEmployee,
  getEmployeeDocuments,
  uploadEmployeeDocument,
  verifyEmployeeDocument,
  deleteEmployeeDocument,
  downloadEmployeeCertificate,
};
