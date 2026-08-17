const SalaryComponent = require("../models/SalaryComponent");
const asyncHandler = require("../utils/asyncHandler");

const createSalaryComponent = asyncHandler(async (req, res) => {
  const { name, description, type, calculationType, amount, status } = req.body;
  const component = await SalaryComponent.create({ name, description, type, calculationType, amount, status });
  res.status(201).json({ success: true, data: component });
});

const getSalaryComponents = asyncHandler(async (req, res) => {
  const { search, type, calculationType, status, page = 1, limit = 10 } = req.query;
  const query = {};
  if (search) query.$text = { $search: search };
  if (type) query.type = type;
  if (calculationType) query.calculationType = calculationType;
  if (status) query.status = status;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const [components, total] = await Promise.all([
    SalaryComponent.find(query).sort({ name: 1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    SalaryComponent.countDocuments(query),
  ]);
  res.json({ success: true, data: components, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
});

const getAllSalaryComponents = asyncHandler(async (req, res) => {
  const components = await SalaryComponent.find({ status: "active" }).select("name type calculationType amount").sort({ name: 1 });
  res.json({ success: true, data: components });
});

const updateSalaryComponent = asyncHandler(async (req, res) => {
  const { name, description, type, calculationType, amount, status } = req.body;
  const existing = await SalaryComponent.findById(req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: "Salary component not found" });
  if (existing.status === "locked") return res.status(400).json({ success: false, message: "This component is locked and cannot be modified" });

  const component = await SalaryComponent.findByIdAndUpdate(req.params.id, { name, description, type, calculationType, amount, status }, { new: true, runValidators: true });
  res.json({ success: true, data: component });
});

const deleteSalaryComponent = asyncHandler(async (req, res) => {
  const existing = await SalaryComponent.findById(req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: "Salary component not found" });
  if (existing.status === "locked") return res.status(400).json({ success: false, message: "This component is locked and cannot be deleted" });

  await SalaryComponent.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Salary component deleted" });
});

module.exports = { createSalaryComponent, getSalaryComponents, getAllSalaryComponents, updateSalaryComponent, deleteSalaryComponent };
