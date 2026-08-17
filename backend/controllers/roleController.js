const Role = require("../models/Role");
const asyncHandler = require("../utils/asyncHandler");
const { PERMISSION_CATALOG, getTotalPermissionCount, getAllValidKeys } = require("../constants/permissionCatalog");

// §54 — the page-level "X of Y selected" count. Y is the REAL total (~309),
// not the spec's claimed 606 — see permissionCatalog.js for why.
const getPermissionCatalog = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      modules: PERMISSION_CATALOG,
      totalPermissions: getTotalPermissionCount(),
    },
  });
});

// Strips out any submitted key that isn't actually in the catalog — a role
// can never be saved with a fabricated or stale permission key.
const sanitizePermissions = (permissions) => {
  if (!Array.isArray(permissions)) return [];
  const validKeys = getAllValidKeys();
  return permissions.filter((key) => validKeys.has(key));
};

const createRole = asyncHandler(async (req, res) => {
  const { name, description, permissions } = req.body;

  const existing = await Role.findOne({ name });
  if (existing) {
    return res.status(400).json({ success: false, message: "A role with this name already exists" });
  }

  const role = await Role.create({
    name,
    description,
    permissions: sanitizePermissions(permissions),
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: role });
});

const getRoles = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;

  const query = {};
  if (search) query.$text = { $search: search };

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [roles, total] = await Promise.all([
    Role.find(query).sort({ name: 1 }).skip(skip).limit(limitNum),
    Role.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: roles,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

const getRole = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id).populate("createdBy", "name email");
  if (!role) {
    return res.status(404).json({ success: false, message: "Role not found" });
  }
  res.json({ success: true, data: role });
});

const updateRole = asyncHandler(async (req, res) => {
  const { name, description, permissions } = req.body;

  if (name) {
    const existing = await Role.findOne({ name, _id: { $ne: req.params.id } });
    if (existing) {
      return res.status(400).json({ success: false, message: "A role with this name already exists" });
    }
  }

  const role = await Role.findByIdAndUpdate(
    req.params.id,
    { name, description, permissions: sanitizePermissions(permissions) },
    { new: true, runValidators: true }
  );

  if (!role) {
    return res.status(404).json({ success: false, message: "Role not found" });
  }
  res.json({ success: true, data: role });
});

const deleteRole = asyncHandler(async (req, res) => {
  const role = await Role.findByIdAndDelete(req.params.id);
  if (!role) {
    return res.status(404).json({ success: false, message: "Role not found" });
  }
  res.json({ success: true, message: "Role deleted" });
});

module.exports = { getPermissionCatalog, createRole, getRoles, getRole, updateRole, deleteRole };
