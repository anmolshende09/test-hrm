const ContractType = require("../models/ContractType");
const asyncHandler = require("../utils/asyncHandler");

const createContractType = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    defaultDurationMonths,
    probationPeriodMonths,
    noticePeriodDays,
    isRenewable,
    status,
  } = req.body;

  const contractType = await ContractType.create({
    name,
    description,
    defaultDurationMonths: defaultDurationMonths === "" ? null : defaultDurationMonths,
    probationPeriodMonths: probationPeriodMonths === "" ? null : probationPeriodMonths,
    noticePeriodDays: noticePeriodDays === "" ? null : noticePeriodDays,
    isRenewable,
    status,
  });

  res.status(201).json({ success: true, data: contractType });
});

const getContractTypes = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 10 } = req.query;

  const query = {};
  if (search) query.$text = { $search: search };
  if (status) query.status = status;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [contractTypes, total] = await Promise.all([
    ContractType.find(query).sort({ name: 1 }).skip(skip).limit(limitNum),
    ContractType.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: contractTypes,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

// Lightweight, unpaginated list of active contract types — used by the
// Employee Contracts form dropdown once that module is built.
const getContractTypesAll = asyncHandler(async (req, res) => {
  const contractTypes = await ContractType.find({ status: "active" })
    .sort({ name: 1 })
    .select("name defaultDurationMonths probationPeriodMonths noticePeriodDays isRenewable");
  res.json({ success: true, data: contractTypes });
});

const updateContractType = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    defaultDurationMonths,
    probationPeriodMonths,
    noticePeriodDays,
    isRenewable,
    status,
  } = req.body;

  const contractType = await ContractType.findByIdAndUpdate(
    req.params.id,
    {
      name,
      description,
      defaultDurationMonths: defaultDurationMonths === "" ? null : defaultDurationMonths,
      probationPeriodMonths: probationPeriodMonths === "" ? null : probationPeriodMonths,
      noticePeriodDays: noticePeriodDays === "" ? null : noticePeriodDays,
      isRenewable,
      status,
    },
    { new: true, runValidators: true }
  );

  if (!contractType) {
    return res.status(404).json({ success: false, message: "Contract type not found" });
  }
  res.json({ success: true, data: contractType });
});

const deleteContractType = asyncHandler(async (req, res) => {
  const contractType = await ContractType.findByIdAndDelete(req.params.id);
  if (!contractType) {
    return res.status(404).json({ success: false, message: "Contract type not found" });
  }
  res.json({ success: true, message: "Contract type deleted" });
});

module.exports = {
  createContractType,
  getContractTypes,
  getContractTypesAll,
  updateContractType,
  deleteContractType,
};