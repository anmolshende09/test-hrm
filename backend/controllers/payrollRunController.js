const PayrollRun = require("../models/PayrollRun");
const EmployeeSalary = require("../models/EmployeeSalary");
const Payslip = require("../models/Payslip");
const asyncHandler = require("../utils/asyncHandler");
const { computeTotals } = require("./employeeSalaryController");
const { toCSV, parseCSV } = require("../utils/csv");

const createPayrollRun = asyncHandler(async (req, res) => {
  const { title, frequency, periodStart, periodEnd, payDate, status } = req.body;
  const run = await PayrollRun.create({ title, frequency, periodStart, periodEnd, payDate, status, createdBy: req.user._id });
  res.status(201).json({ success: true, data: run });
});

const getPayrollRuns = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 10 } = req.query;
  const query = {};
  if (status) query.status = status;
  if (search) query.title = { $regex: search, $options: "i" };

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const [runs, total] = await Promise.all([
    PayrollRun.find(query).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    PayrollRun.countDocuments(query),
  ]);
  res.json({ success: true, data: runs, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
});

const updatePayrollRun = asyncHandler(async (req, res) => {
  const { title, frequency, periodStart, periodEnd, payDate, status } = req.body;
  const run = await PayrollRun.findByIdAndUpdate(req.params.id, { title, frequency, periodStart, periodEnd, payDate, status }, { new: true, runValidators: true });
  if (!run) return res.status(404).json({ success: false, message: "Payroll run not found" });

  // When the run is marked as "processing", generate payslips for all
  // employees that have a salary record.
  if (status === "processing") {
    const salaries = await EmployeeSalary.find({ status: "active" }).populate("components.component");
    let grossPay = 0, totalDeductions = 0, netPay = 0;

    for (const salary of salaries) {
      const totals = await computeTotals(salary.basicSalary, salary.components);
      grossPay += totals.grossPay;
      totalDeductions += totals.totalDeductions;
      netPay += totals.netPay;

      await Payslip.findOneAndUpdate(
        { employee: salary.employee, payrollRun: run._id },
        { employee: salary.employee, payrollRun: run._id, payDate: run.payDate, basicSalary: salary.basicSalary, ...totals },
        { upsert: true, setDefaultsOnInsert: true }
      );
    }

    await PayrollRun.findByIdAndUpdate(run._id, { totalEmployees: salaries.length, grossPay, totalDeductions, netPay, status: "completed" });
    const completed = await PayrollRun.findById(run._id);
    return res.json({ success: true, data: completed });
  }

  res.json({ success: true, data: run });
});

const deletePayrollRun = asyncHandler(async (req, res) => {
  const run = await PayrollRun.findByIdAndDelete(req.params.id);
  if (!run) return res.status(404).json({ success: false, message: "Payroll run not found" });
  // Clean up generated payslips for this run
  await Payslip.deleteMany({ payrollRun: req.params.id });
  res.json({ success: true, message: "Payroll run deleted" });
});

const exportPayrollRun = asyncHandler(async (req, res) => {
  const run = await PayrollRun.findById(req.params.id);
  if (!run) return res.status(404).json({ success: false, message: "Payroll run not found" });

  const payslips = await Payslip.find({ payrollRun: req.params.id }).populate("employee", "name employeeId");
  const csv = toCSV(payslips, [
    { label: "Employee ID", value: (r) => r.employee?.employeeId || "" },
    { label: "Employee Name", value: (r) => r.employee?.name || "" },
    { label: "Basic Salary", value: (r) => r.basicSalary },
    { label: "Gross Pay", value: (r) => r.grossPay },
    { label: "Total Deductions", value: (r) => r.totalDeductions },
    { label: "Net Pay", value: (r) => r.netPay },
    { label: "Pay Date", value: (r) => r.payDate?.toISOString().split("T")[0] || "" },
  ]);

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="payroll-${run.title.replace(/\s+/g, "-")}.csv"`);
  res.send(csv);
});

module.exports = { createPayrollRun, getPayrollRuns, updatePayrollRun, deletePayrollRun, exportPayrollRun };
