const Employee = require("../models/Employee");
const asyncHandler = require("../utils/asyncHandler");

// multipart/form-data always sends "manager"/"shift" as strings, even when
// the person picked "None" in the select — Mongoose would otherwise try to
// cast "" to an ObjectId and fail validation, so normalize both to null.
const normalizeOptionalRefs = (payload) => {
  if (payload.manager === "" || payload.manager === undefined) {
    payload.manager = null;
  }
  if (payload.shift === "" || payload.shift === undefined) {
    payload.shift = null;
  }
  return payload;
};

// @desc    Create an employee
// @route   POST /api/employees
// @access  Private (admin, hr_manager)
const createEmployee = asyncHandler(async (req, res) => {
  const payload = normalizeOptionalRefs({ ...req.body });
  if (req.file) {
    payload.profilePicture = `/uploads/employees/${req.file.filename}`;
  }
  const employee = await Employee.create(payload);
  const populated = await employee.populate([
    { path: "department", select: "name" },
    { path: "designation", select: "name" },
    { path: "shift", select: "name startTime endTime" },
  ]);
  res.status(201).json({ success: true, data: populated });
});

// @desc    Get employees with search + pagination
// @route   GET /api/employees?search=&department=&status=&page=&limit=
// @access  Private
const getEmployees = asyncHandler(async (req, res) => {
  const { search, department, status, page = 1, limit = 10 } = req.query;

  const query = {};
  if (search) {
    query.$text = { $search: search };
  }
  if (department) query.department = department;
  if (status) query.status = status;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [employees, total] = await Promise.all([
    Employee.find(query)
      .populate("department", "name")
      .populate("designation", "name")
      .populate("shift", "name startTime endTime")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Employee.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: employees,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
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

// @desc    Get a single employee
// @route   GET /api/employees/:id
// @access  Private
const getEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id)
    .populate("department", "name")
    .populate("designation", "name")
    .populate("shift", "name startTime endTime");
  if (!employee) {
    return res.status(404).json({ success: false, message: "Employee not found" });
  }
  res.json({ success: true, data: employee });
});

// @desc    Update an employee
// @route   PUT /api/employees/:id
// @access  Private (admin, hr_manager)
const updateEmployee = asyncHandler(async (req, res) => {
  const payload = normalizeOptionalRefs({ ...req.body });
  if (req.file) {
    payload.profilePicture = `/uploads/employees/${req.file.filename}`;
  }

  if (payload.manager && payload.manager === req.params.id) {
    return res.status(400).json({ success: false, message: "An employee can't be their own manager" });
  }

  const employee = await Employee.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  })
    .populate("department", "name")
    .populate("designation", "name")
    .populate("shift", "name startTime endTime");

  if (!employee) {
    return res.status(404).json({ success: false, message: "Employee not found" });
  }
  res.json({ success: true, data: employee });
});

// @desc    Delete an employee
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

  res.json({ success: true, message: "Employee deleted" });
});

module.exports = {
  createEmployee,
  getEmployees,
  getOrgChart,
  getEmployee,
  updateEmployee,
  deleteEmployee,
};
