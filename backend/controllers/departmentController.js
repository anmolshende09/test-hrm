const Department = require("../models/Department");
const Employee = require("../models/Employee");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Create a department
// @route   POST /api/departments
// @access  Private (admin, hr_manager)
const createDepartment = asyncHandler(async (req, res) => {
  const { name, description, branch, status } = req.body;
  const department = await Department.create({
    name,
    description,
    branch: branch || null,
    status,
  });
  const populated = await department.populate("branch", "name");
  res.status(201).json({ success: true, data: populated });
});

// @desc    Get departments with search + filter (branch/status) + pagination,
//          plus live employee counts. Defaults to a large page size so
//          existing callers that don't pass page/limit still get everything.
// @route   GET /api/departments?search=&branch=&status=&page=&limit=
// @access  Private
const getDepartments = asyncHandler(async (req, res) => {
  const { search, branch, status, page = 1, limit = 50 } = req.query;

  const query = {};
  if (search) query.$text = { $search: search };
  if (branch) query.branch = branch;
  if (status) query.status = status;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 50, 1);
  const skip = (pageNum - 1) * limitNum;

  const [departments, total] = await Promise.all([
    Department.find(query).populate("branch", "name").sort({ name: 1 }).skip(skip).limit(limitNum).lean(),
    Department.countDocuments(query),
  ]);

  const counts = await Employee.aggregate([
    { $group: { _id: "$department", count: { $sum: 1 } } },
  ]);
  const countMap = counts.reduce((acc, c) => {
    acc[c._id.toString()] = c.count;
    return acc;
  }, {});

  const withCounts = departments.map((d) => ({
    ...d,
    employeeCount: countMap[d._id.toString()] || 0,
  }));

  res.json({
    success: true,
    data: withCounts,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

// @desc    Get a single department
// @route   GET /api/departments/:id
// @access  Private
const getDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id).populate("branch", "name");
  if (!department) {
    return res.status(404).json({ success: false, message: "Department not found" });
  }
  const employeeCount = await Employee.countDocuments({ department: department._id });
  res.json({ success: true, data: { ...department.toObject(), employeeCount } });
});

// @desc    Update a department
// @route   PUT /api/departments/:id
// @access  Private (admin, hr_manager)
const updateDepartment = asyncHandler(async (req, res) => {
  const { name, description, branch, status } = req.body;
  const department = await Department.findByIdAndUpdate(
    req.params.id,
    { name, description, branch: branch || null, status },
    { new: true, runValidators: true }
  ).populate("branch", "name");
  if (!department) {
    return res.status(404).json({ success: false, message: "Department not found" });
  }
  res.json({ success: true, data: department });
});

// @desc    Delete a department (blocked if employees still reference it)
// @route   DELETE /api/departments/:id
// @access  Private (admin)
const deleteDepartment = asyncHandler(async (req, res) => {
  const inUse = await Employee.countDocuments({ department: req.params.id });
  if (inUse > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete department: ${inUse} employee(s) are still assigned to it`,
    });
  }

  const department = await Department.findByIdAndDelete(req.params.id);
  if (!department) {
    return res.status(404).json({ success: false, message: "Department not found" });
  }
  res.json({ success: true, message: "Department deleted" });
});

module.exports = {
  createDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
};
