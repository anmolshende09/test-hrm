const EmployeeContract = require("../models/EmployeeContract");
const asyncHandler = require("../utils/asyncHandler");

const POPULATE_EMPLOYEE = "name employeeId email";
const POPULATE_CONTRACT_TYPE = "name defaultDurationMonths probationPeriodMonths noticePeriodDays isRenewable";
const POPULATE_USER = "name email";

const createEmployeeContract = asyncHandler(async (req, res) => {
  const {
    contractNumber,
    employee,
    contractType,
    startDate,
    endDate,
    basicSalary,
    allowances,
    benefits,
    termsAndConditions,
    status,
  } = req.body;

  const contract = await EmployeeContract.create({
    contractNumber,
    employee,
    contractType,
    startDate,
    endDate: endDate || null,
    basicSalary: basicSalary === "" || basicSalary === undefined ? null : basicSalary,
    allowances: allowances || [],
    benefits: benefits || [],
    termsAndConditions,
    status,
    createdBy: req.user._id,
  });

  const populated = await contract.populate([
    { path: "employee", select: POPULATE_EMPLOYEE },
    { path: "contractType", select: POPULATE_CONTRACT_TYPE },
  ]);

  res.status(201).json({ success: true, data: populated });
});

const getEmployeeContracts = asyncHandler(async (req, res) => {
  const { search, employee, contractType, status, page = 1, limit = 10 } = req.query;

  const query = {};
  if (search) query.$text = { $search: search };
  if (employee) query.employee = employee;
  if (contractType) query.contractType = contractType;
  if (status) query.status = status;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [contracts, total] = await Promise.all([
    EmployeeContract.find(query)
      .populate("employee", POPULATE_EMPLOYEE)
      .populate("contractType", POPULATE_CONTRACT_TYPE)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    EmployeeContract.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: contracts,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

const getEmployeeContract = asyncHandler(async (req, res) => {
  const contract = await EmployeeContract.findById(req.params.id)
    .populate("employee", POPULATE_EMPLOYEE)
    .populate("contractType", POPULATE_CONTRACT_TYPE)
    .populate("approvedBy", POPULATE_USER)
    .populate("createdBy", POPULATE_USER)
    .populate("amendments.amendedBy", POPULATE_USER);

  if (!contract) {
    return res.status(404).json({ success: false, message: "Contract not found" });
  }
  res.json({ success: true, data: contract });
});

const updateEmployeeContract = asyncHandler(async (req, res) => {
  const {
    contractNumber,
    employee,
    contractType,
    startDate,
    endDate,
    basicSalary,
    allowances,
    benefits,
    termsAndConditions,
    status,
  } = req.body;

  const contract = await EmployeeContract.findByIdAndUpdate(
    req.params.id,
    {
      contractNumber,
      employee,
      contractType,
      startDate,
      endDate: endDate || null,
      basicSalary: basicSalary === "" || basicSalary === undefined ? null : basicSalary,
      allowances: allowances || [],
      benefits: benefits || [],
      termsAndConditions,
      status,
    },
    { new: true, runValidators: true }
  )
    .populate("employee", POPULATE_EMPLOYEE)
    .populate("contractType", POPULATE_CONTRACT_TYPE);

  if (!contract) {
    return res.status(404).json({ success: false, message: "Contract not found" });
  }
  res.json({ success: true, data: contract });
});

// Draft -> Active, stamping who approved it and when.
const approveEmployeeContract = asyncHandler(async (req, res) => {
  const contract = await EmployeeContract.findByIdAndUpdate(
    req.params.id,
    { status: "active", approvedBy: req.user._id, approvedAt: new Date() },
    { new: true }
  )
    .populate("employee", POPULATE_EMPLOYEE)
    .populate("contractType", POPULATE_CONTRACT_TYPE)
    .populate("approvedBy", POPULATE_USER);

  if (!contract) {
    return res.status(404).json({ success: false, message: "Contract not found" });
  }
  res.json({ success: true, data: contract });
});

// Extends the end date and logs the change as an amendment — reactivates
// the contract if it had lapsed into "expired".
const renewEmployeeContract = asyncHandler(async (req, res) => {
  const { newEndDate, note } = req.body;
  if (!newEndDate) {
    return res.status(400).json({ success: false, message: "A new end date is required to renew" });
  }

  const contract = await EmployeeContract.findById(req.params.id);
  if (!contract) {
    return res.status(404).json({ success: false, message: "Contract not found" });
  }

  const previousEndDate = contract.endDate;
  contract.endDate = newEndDate;
  if (contract.status === "expired") contract.status = "active";
  contract.amendments.push({
    description:
      note ||
      `Contract renewed — end date moved from ${previousEndDate ? previousEndDate.toDateString() : "none"} to ${new Date(newEndDate).toDateString()}`,
    amendedBy: req.user._id,
  });

  await contract.save();
  const populated = await contract.populate([
    { path: "employee", select: POPULATE_EMPLOYEE },
    { path: "contractType", select: POPULATE_CONTRACT_TYPE },
    { path: "amendments.amendedBy", select: POPULATE_USER },
  ]);

  res.json({ success: true, data: populated });
});

// Appends a manually-described amendment record without touching other fields.
const addAmendment = asyncHandler(async (req, res) => {
  const { description } = req.body;
  if (!description) {
    return res.status(400).json({ success: false, message: "Amendment description is required" });
  }

  const contract = await EmployeeContract.findByIdAndUpdate(
    req.params.id,
    { $push: { amendments: { description, amendedBy: req.user._id } } },
    { new: true }
  )
    .populate("employee", POPULATE_EMPLOYEE)
    .populate("contractType", POPULATE_CONTRACT_TYPE)
    .populate("amendments.amendedBy", POPULATE_USER);

  if (!contract) {
    return res.status(404).json({ success: false, message: "Contract not found" });
  }
  res.json({ success: true, data: contract });
});

const deleteEmployeeContract = asyncHandler(async (req, res) => {
  const contract = await EmployeeContract.findByIdAndDelete(req.params.id);
  if (!contract) {
    return res.status(404).json({ success: false, message: "Contract not found" });
  }
  res.json({ success: true, message: "Contract deleted" });
});

module.exports = {
  createEmployeeContract,
  getEmployeeContracts,
  getEmployeeContract,
  updateEmployeeContract,
  approveEmployeeContract,
  renewEmployeeContract,
  addAmendment,
  deleteEmployeeContract,
};