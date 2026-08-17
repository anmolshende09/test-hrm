const ContractTemplate = require("../models/ContractTemplate");
const EmployeeContract = require("../models/EmployeeContract");
const asyncHandler = require("../utils/asyncHandler");
const { mergeTemplate } = require("../utils/templateMerge");

const POPULATE_CONTRACT_TYPE = "name isRenewable";
const POPULATE_USER = "name email";

// Only one default template per contract type — unset any existing default
// on the same contractType whenever a new one is marked default.
const enforceSingleDefault = async (contractType, excludeId) => {
  await ContractTemplate.updateMany(
    { contractType, _id: { $ne: excludeId } },
    { $set: { isDefault: false } }
  );
};

const createContractTemplate = asyncHandler(async (req, res) => {
  const { name, description, contractType, templateContent, variables, clauses, isDefault, status } = req.body;

  const template = await ContractTemplate.create({
    name,
    description,
    contractType,
    templateContent,
    variables: variables || [],
    clauses: clauses || [],
    isDefault,
    status,
    createdBy: req.user._id,
  });

  if (template.isDefault) await enforceSingleDefault(template.contractType, template._id);

  const populated = await template.populate("contractType", POPULATE_CONTRACT_TYPE);
  res.status(201).json({ success: true, data: populated });
});

const getContractTemplates = asyncHandler(async (req, res) => {
  const { search, contractType, status, page = 1, limit = 10 } = req.query;

  const query = {};
  if (search) query.$text = { $search: search };
  if (contractType) query.contractType = contractType;
  if (status) query.status = status;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [templates, total] = await Promise.all([
    ContractTemplate.find(query)
      .populate("contractType", POPULATE_CONTRACT_TYPE)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum),
    ContractTemplate.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: templates,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

const getContractTemplate = asyncHandler(async (req, res) => {
  const template = await ContractTemplate.findById(req.params.id)
    .populate("contractType", POPULATE_CONTRACT_TYPE)
    .populate("createdBy", POPULATE_USER);
  if (!template) {
    return res.status(404).json({ success: false, message: "Contract template not found" });
  }
  res.json({ success: true, data: template });
});

const updateContractTemplate = asyncHandler(async (req, res) => {
  const { name, description, contractType, templateContent, variables, clauses, isDefault, status } = req.body;

  const template = await ContractTemplate.findByIdAndUpdate(
    req.params.id,
    { name, description, contractType, templateContent, variables: variables || [], clauses: clauses || [], isDefault, status },
    { new: true, runValidators: true }
  ).populate("contractType", POPULATE_CONTRACT_TYPE);

  if (!template) {
    return res.status(404).json({ success: false, message: "Contract template not found" });
  }
  if (template.isDefault) await enforceSingleDefault(template.contractType._id, template._id);

  res.json({ success: true, data: template });
});

// Merges template variables and creates a real draft EmployeeContract —
// per §7.4.2 "Contract Generation: quickly generate new contracts from templates".
const generateContract = asyncHandler(async (req, res) => {
  const { employee, contractNumber, startDate, endDate, basicSalary, values } = req.body;

  if (!employee || !contractNumber || !startDate) {
    return res.status(400).json({ success: false, message: "employee, contractNumber, and startDate are required" });
  }

  const template = await ContractTemplate.findById(req.params.id);
  if (!template) {
    return res.status(404).json({ success: false, message: "Contract template not found" });
  }

  const mergedTerms = mergeTemplate(template.templateContent, values || {});
  const mergedClauses = template.clauses.map((clause) => mergeTemplate(clause, values || {}));
  const fullTerms = [mergedTerms, ...mergedClauses].filter(Boolean).join("\n\n");

  const contract = await EmployeeContract.create({
    contractNumber,
    employee,
    contractType: template.contractType,
    startDate,
    endDate: endDate || null,
    basicSalary: basicSalary === "" || basicSalary === undefined ? null : basicSalary,
    termsAndConditions: fullTerms,
    status: "draft",
    createdBy: req.user._id,
  });

  const populated = await contract.populate([
    { path: "employee", select: "name employeeId email" },
    { path: "contractType", select: POPULATE_CONTRACT_TYPE },
  ]);

  res.status(201).json({ success: true, data: populated, message: "Contract generated from template" });
});

const deleteContractTemplate = asyncHandler(async (req, res) => {
  const template = await ContractTemplate.findByIdAndDelete(req.params.id);
  if (!template) {
    return res.status(404).json({ success: false, message: "Contract template not found" });
  }
  res.json({ success: true, message: "Contract template deleted" });
});

module.exports = {
  createContractTemplate,
  getContractTemplates,
  getContractTemplate,
  updateContractTemplate,
  generateContract,
  deleteContractTemplate,
};