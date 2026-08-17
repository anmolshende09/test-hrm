const Currency = require("../models/Currency");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Create a currency
// @route   POST /api/currencies
// @access  Private (admin, hr_manager)
const createCurrency = asyncHandler(async (req, res) => {
  const { name, code, symbol, isDefault } = req.body;

  // If this currency is being made default,
  // remove the default status from all other currencies.
  if (isDefault) {
    await Currency.updateMany({}, { isDefault: false });
  }

  const currency = await Currency.create({
    name,
    code,
    symbol,
    isDefault: isDefault || false,
  });

  res.status(201).json({
    success: true,
    data: currency,
  });
});

// @desc    Get currencies with search + pagination
// @route   GET /api/currencies?search=&page=&limit=
// @access  Private
const getCurrencies = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 50 } = req.query;

  const query = {};

  if (search) {
    query.$text = { $search: search };
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 50, 1);
  const skip = (pageNum - 1) * limitNum;

  const [currencies, total] = await Promise.all([
    Currency.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),

    Currency.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: currencies,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// @desc    Get a single currency
// @route   GET /api/currencies/:id
// @access  Private
const getCurrency = asyncHandler(async (req, res) => {
  const currency = await Currency.findById(req.params.id);

  if (!currency) {
    return res.status(404).json({
      success: false,
      message: "Currency not found",
    });
  }

  res.json({
    success: true,
    data: currency,
  });
});

// @desc    Update a currency
// @route   PUT /api/currencies/:id
// @access  Private (admin, hr_manager)
const updateCurrency = asyncHandler(async (req, res) => {
  const { name, code, symbol, isDefault } = req.body;

  // If this currency is being made default,
  // remove the default status from all other currencies.
  if (isDefault) {
    await Currency.updateMany(
      { _id: { $ne: req.params.id } },
      { isDefault: false }
    );
  }

  const currency = await Currency.findByIdAndUpdate(
    req.params.id,
    {
      name,
      code,
      symbol,
      isDefault: isDefault || false,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!currency) {
    return res.status(404).json({
      success: false,
      message: "Currency not found",
    });
  }

  res.json({
    success: true,
    data: currency,
  });
});

// @desc    Delete a currency
// @route   DELETE /api/currencies/:id
// @access  Private (admin)
const deleteCurrency = asyncHandler(async (req, res) => {
  const currency = await Currency.findById(req.params.id);

  if (!currency) {
    return res.status(404).json({
      success: false,
      message: "Currency not found",
    });
  }

  if (currency.isDefault) {
    return res.status(400).json({
      success: false,
      message: "The default currency cannot be deleted",
    });
  }

  await Currency.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: "Currency deleted",
  });
});

module.exports = {
  createCurrency,
  getCurrencies,
  getCurrency,
  updateCurrency,
  deleteCurrency,
};