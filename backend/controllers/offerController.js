const Offer = require("../models/Offer");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Create an offer
// @route   POST /api/offers
// @access  Private (admin, hr_manager)
const createOffer = asyncHandler(async (req, res) => {
  const { candidate, salary, startDate, expiryDate, status } = req.body;
  const offer = await Offer.create({ candidate, salary, startDate, expiryDate, status, createdBy: req.user._id });
  const populated = await offer.populate("candidate", "name email job");
  res.status(201).json({ success: true, data: populated });
});

// @desc    Get offers with status/candidate filters + pagination
// @route   GET /api/offers?status=&candidate=&page=&limit=
// @access  Private (admin, hr_manager)
const getOffers = asyncHandler(async (req, res) => {
  const { status, candidate, page = 1, limit = 10 } = req.query;

  const query = {};
  if (status) query.status = status;
  if (candidate) query.candidate = candidate;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [offers, total] = await Promise.all([
    Offer.find(query).populate("candidate", "name email job").sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    Offer.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: offers,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

// @desc    Update an offer (salary/dates/status)
// @route   PUT /api/offers/:id
// @access  Private (admin, hr_manager)
const updateOffer = asyncHandler(async (req, res) => {
  const { salary, startDate, expiryDate, status } = req.body;
  const offer = await Offer.findByIdAndUpdate(
    req.params.id,
    { salary, startDate, expiryDate, status },
    { new: true, runValidators: true }
  ).populate("candidate", "name email job");
  if (!offer) {
    return res.status(404).json({ success: false, message: "Offer not found" });
  }
  res.json({ success: true, data: offer });
});

// @desc    Delete/withdraw an offer record
// @route   DELETE /api/offers/:id
// @access  Private (admin, hr_manager)
const deleteOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findByIdAndDelete(req.params.id);
  if (!offer) {
    return res.status(404).json({ success: false, message: "Offer not found" });
  }
  res.json({ success: true, message: "Offer deleted" });
});

module.exports = { createOffer, getOffers, updateOffer, deleteOffer };
