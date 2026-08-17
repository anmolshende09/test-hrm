const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Register a new user (admin/hr_manager typically created this way,
//          employees are usually created via the Employee module + invite)
// @route   POST /api/auth/register
// @access  Public (in production, restrict this to admin-only after first setup)
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, employee } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ success: false, message: "A user with this email already exists" });
  }

  const user = await User.create({ name, email, password, role, employee: employee || null });

  res.status(201).json({
    success: true,
    data: {
      user,
      token: generateToken(user._id),
    },
  });
});

// @desc    Login and receive a JWT
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, message: "This account has been deactivated" });
  }

  res.json({
    success: true,
    data: {
      user,
      token: generateToken(user._id),
    },
  });
});

// @desc    Get the currently authenticated user's profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("employee");
  res.json({ success: true, data: user });
});

// @desc    Logout (stateless JWT - client discards the token; endpoint kept
//          for symmetry and future token-blacklisting support)
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
});

module.exports = { register, login, getMe, logout };
