const Promotion = require("../models/Promotion");
const Employee = require("../models/Employee");
const asyncHandler = require("../utils/asyncHandler");

const filePaths = (files) => (files || []).map((f) => `/uploads/lifecycle-documents/${f.filename}`);

// @desc    Create a promotion request. Snapshots the employee's CURRENT
//          designation as `previousDesignation` at the moment of creation.
// @route   POST /api/promotions
// @access  Private (admin, hr_manager)
const createPromotion = asyncHandler(async (req, res) => {
  const { employee, newDesignation, effectiveDate, status } = req.body;

  const employeeDoc = await Employee.findById(employee);
  if (!employeeDoc) {
    return res.status(404).json({ success: false, message: "Employee not found" });
  }

  const promotion = await Promotion.create({
    employee,
    previousDesignation: employeeDoc.designation,
    newDesignation,
    effectiveDate,
    status,
    documents: filePaths(req.files),
    createdBy: req.user._id,
  });

  const populated = await promotion.populate([
    { path: "employee", select: "name email" },
    { path: "previousDesignation", select: "name" },
    { path: "newDesignation", select: "name" },
  ]);
  res.status(201).json({ success: true, data: populated });
});

// @desc    Get promotions with search/status filters + pagination
// @route   GET /api/promotions?search=&status=&page=&limit=
// @access  Private (admin, hr_manager)
const getPromotions = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = {};
  if (status) query.status = status;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [promotions, total] = await Promise.all([
    Promotion.find(query)
      .populate("employee", "name email")
      .populate("previousDesignation", "name")
      .populate("newDesignation", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Promotion.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: promotions,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

// @desc    Update a promotion. Approving writes `newDesignation` onto the
//          employee's actual Employee.designation field.
// @route   PUT /api/promotions/:id
// @access  Private (admin, hr_manager)
const updatePromotion = asyncHandler(async (req, res) => {
  const { newDesignation, effectiveDate, status } = req.body;

  const payload = { newDesignation, effectiveDate, status };
  if (req.files && req.files.length > 0) {
    payload.documents = filePaths(req.files);
  }

  const promotion = await Promotion.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true })
    .populate("employee", "name email")
    .populate("previousDesignation", "name")
    .populate("newDesignation", "name");

  if (!promotion) {
    return res.status(404).json({ success: false, message: "Promotion not found" });
  }

  if (status === "approved") {
    await Employee.findByIdAndUpdate(promotion.employee._id, { designation: promotion.newDesignation._id });
  }

  res.json({ success: true, data: promotion });
});

// @desc    Delete a promotion record
// @route   DELETE /api/promotions/:id
// @access  Private (admin, hr_manager)
const deletePromotion = asyncHandler(async (req, res) => {
  const promotion = await Promotion.findByIdAndDelete(req.params.id);
  if (!promotion) {
    return res.status(404).json({ success: false, message: "Promotion not found" });
  }
  res.json({ success: true, message: "Promotion deleted" });
});

module.exports = { createPromotion, getPromotions, updatePromotion, deletePromotion };
