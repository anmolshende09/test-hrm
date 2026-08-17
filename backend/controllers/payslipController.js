const Payslip = require("../models/Payslip");
const asyncHandler = require("../utils/asyncHandler");

const getPayslips = asyncHandler(async (req, res) => {
  const { month, year, search, page = 1, limit = 10 } = req.query;
  const query = {};

  if (month && year) {
    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 0, 23, 59, 59);
    query.payDate = { $gte: from, $lte: to };
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);

  const [payslips, total] = await Promise.all([
    Payslip.find(query).populate("employee", "name employeeId").sort({ payDate: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    Payslip.countDocuments(query),
  ]);

  const filtered = search
    ? payslips.filter((p) => p.employee?.name?.toLowerCase().includes(search.toLowerCase()) || p.employee?.employeeId?.toLowerCase().includes(search.toLowerCase()))
    : payslips;

  res.json({ success: true, data: filtered, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
});

const getPayslip = asyncHandler(async (req, res) => {
  const payslip = await Payslip.findById(req.params.id)
    .populate("employee", "name employeeId department designation")
    .populate("payrollRun", "title frequency periodStart periodEnd");
  if (!payslip) return res.status(404).json({ success: false, message: "Payslip not found" });
  res.json({ success: true, data: payslip });
});

module.exports = { getPayslips, getPayslip };
