const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

// §8.2 — creates a system account directly (distinct from self-service
// signup, if one exists elsewhere) — an admin sets the initial password.
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ success: false, message: "A user with this email already exists" });
  }

  const user = await User.create({ name, email, password, role });
  res.status(201).json({ success: true, data: user });
});

const getUsers = asyncHandler(async (req, res) => {
  const { search, role, page = 1, limit = 10 } = req.query;

  const query = {};
  if (search) query.$text = { $search: search };
  if (role) query.role = role;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    User.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: users,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  res.json({ success: true, data: user });
});

// §7.2 — name/email/role only. Password is handled separately via
// updateUserPassword (§7.3), never bundled into this general edit.
const updateUser = asyncHandler(async (req, res) => {
  const { name, email, role } = req.body;

  if (email) {
    const existing = await User.findOne({ email, _id: { $ne: req.params.id } });
    if (existing) {
      return res.status(400).json({ success: false, message: "A user with this email already exists" });
    }
  }

  const user = await User.findByIdAndUpdate(req.params.id, { name, email, role }, { new: true, runValidators: true });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  res.json({ success: true, data: user });
});

// §7.3 — admin-initiated password reset. No current-password check since
// this is an admin acting on someone else's account, not a self-service
// change flow.
const updateUserPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;

  const user = await User.findById(req.params.id).select("+password");
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  user.password = newPassword; // pre-save hook on User model re-hashes this
  await user.save();

  res.json({ success: true, message: "Password updated" });
});

// §7.4 — lock/unlock account access via the existing isActive field.
const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  if (req.params.id === String(req.user._id) && isActive === false) {
    return res.status(400).json({ success: false, message: "You can't lock your own account" });
  }

  const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  res.json({ success: true, data: user });
});

const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === String(req.user._id)) {
    return res.status(400).json({ success: false, message: "You can't delete your own account" });
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  res.json({ success: true, message: "User deleted" });
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  updateUserPassword,
  updateUserStatus,
  deleteUser,
};
