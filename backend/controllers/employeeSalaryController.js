const EmployeeSalary = require("../models/EmployeeSalary");
const SalaryComponent = require("../models/SalaryComponent");
const asyncHandler = require("../utils/asyncHandler");

// Compute gross/net from basic + components
const computeTotals = async (basicSalary, componentAssignments) => {
  const componentIds = componentAssignments.map((c) => c.component);
  const masterComponents = await SalaryComponent.find({ _id: { $in: componentIds } });
  const masterMap = Object.fromEntries(masterComponents.map((c) => [c._id.toString(), c]));

  let totalEarnings = basicSalary;
  let totalDeductions = 0;
  const breakdown = [];

  for (const assignment of componentAssignments) {
    const master = masterMap[assignment.component.toString()];
    if (!master) continue;
    const amount =
      assignment.overrideAmount != null
        ? assignment.overrideAmount
        : master.calculationType === "percentage"
        ? (master.amount / 100) * basicSalary
        : master.amount;

    breakdown.push({ name: master.name, type: master.type, amount });
    if (master.type === "earning") totalEarnings += amount;
    else totalDeductions += amount;
  }

  return { grossPay: totalEarnings, totalDeductions, netPay: totalEarnings - totalDeductions, breakdown };
};

const createEmployeeSalary = asyncHandler(async (req, res) => {
  const { employee, basicSalary, components, status } = req.body;
  const totals = await computeTotals(basicSalary, components || []);
  const salary = await EmployeeSalary.create({ employee, basicSalary, components: components || [], status, ...totals });
  await salary.populate("employee", "name employeeId");
  res.status(201).json({ success: true, data: salary });
});

const getEmployeeSalaries = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 10 } = req.query;
  const query = {};
  if (status) query.status = status;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);

  const [salaries, total] = await Promise.all([
    EmployeeSalary.find(query).populate("employee", "name employeeId").sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    EmployeeSalary.countDocuments(query),
  ]);

  // Apply search post-populate (employee name filter)
  const filtered = search
    ? salaries.filter((s) => s.employee?.name?.toLowerCase().includes(search.toLowerCase()) || s.employee?.employeeId?.toLowerCase().includes(search.toLowerCase()))
    : salaries;

  res.json({ success: true, data: filtered, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
});

const getEmployeeSalary = asyncHandler(async (req, res) => {
  const salary = await EmployeeSalary.findById(req.params.id)
    .populate("employee", "name employeeId")
    .populate("components.component", "name type calculationType amount");
  if (!salary) return res.status(404).json({ success: false, message: "Salary record not found" });
  res.json({ success: true, data: salary });
});

const updateEmployeeSalary = asyncHandler(async (req, res) => {
  const existing = await EmployeeSalary.findById(req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: "Salary record not found" });
  if (existing.status === "locked") return res.status(400).json({ success: false, message: "This salary record is locked and cannot be modified" });

  const { basicSalary, components, status } = req.body;
  const salary = await EmployeeSalary.findByIdAndUpdate(req.params.id, { basicSalary, components: components || [], status }, { new: true, runValidators: true }).populate("employee", "name employeeId");
  res.json({ success: true, data: salary });
});

const deleteEmployeeSalary = asyncHandler(async (req, res) => {
  const existing = await EmployeeSalary.findById(req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: "Salary record not found" });
  if (existing.status === "locked") return res.status(400).json({ success: false, message: "This salary record is locked and cannot be deleted" });

  await EmployeeSalary.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Salary record deleted" });
});

module.exports = { createEmployeeSalary, getEmployeeSalaries, getEmployeeSalary, updateEmployeeSalary, deleteEmployeeSalary, computeTotals };
