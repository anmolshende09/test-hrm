const CalendarEvent = require("../models/CalendarEvent");
const asyncHandler = require("../utils/asyncHandler");
const { buildHolidaysICal } = require("../utils/ical");
const PDFDocument = require("pdfkit");

const CATEGORY_LABELS = {
  national: "National",
  company_specific: "Company Specific",
  religious: "Religious",
};

const formatDateLabel = (date) =>
  new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

// @desc    Create a holiday (always category: "holiday", regardless of body)
// @route   POST /api/holidays
// @access  Private (admin, hr_manager)
const createHoliday = asyncHandler(async (req, res) => {
  const { title, holidayCategory, startDate, endDate, description, branches } = req.body;
  const holiday = await CalendarEvent.create({
    title,
    category: "holiday",
    holidayCategory,
    startDate,
    endDate: endDate || startDate,
    description,
    branches: branches || [],
    createdBy: req.user._id,
  });
  const populated = await holiday.populate("branches", "name");
  res.status(201).json({ success: true, data: populated });
});

// @desc    Get holidays with search + category/branch filters + pagination
// @route   GET /api/holidays?search=&holidayCategory=&branch=&page=&limit=
// @access  Private
const getHolidays = asyncHandler(async (req, res) => {
  const { search, holidayCategory, branch, page = 1, limit = 10 } = req.query;

  const query = { category: "holiday" };
  if (search) query.title = { $regex: search, $options: "i" };
  if (holidayCategory) query.holidayCategory = holidayCategory;
  if (branch) query.branches = branch;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [holidays, total] = await Promise.all([
    CalendarEvent.find(query).populate("branches", "name").sort({ startDate: -1 }).skip(skip).limit(limitNum),
    CalendarEvent.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: holidays,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

// @desc    Get a single holiday
// @route   GET /api/holidays/:id
// @access  Private
const getHoliday = asyncHandler(async (req, res) => {
  const holiday = await CalendarEvent.findOne({ _id: req.params.id, category: "holiday" }).populate(
    "branches",
    "name"
  );
  if (!holiday) {
    return res.status(404).json({ success: false, message: "Holiday not found" });
  }
  res.json({ success: true, data: holiday });
});

// @desc    Update a holiday
// @route   PUT /api/holidays/:id
// @access  Private (admin, hr_manager)
const updateHoliday = asyncHandler(async (req, res) => {
  const { title, holidayCategory, startDate, endDate, description, branches } = req.body;
  const holiday = await CalendarEvent.findOneAndUpdate(
    { _id: req.params.id, category: "holiday" },
    { title, holidayCategory, startDate, endDate, description, branches: branches || [] },
    { new: true, runValidators: true }
  ).populate("branches", "name");

  if (!holiday) {
    return res.status(404).json({ success: false, message: "Holiday not found" });
  }
  res.json({ success: true, data: holiday });
});

// @desc    Delete a holiday
// @route   DELETE /api/holidays/:id
// @access  Private (admin, hr_manager)
const deleteHoliday = asyncHandler(async (req, res) => {
  const holiday = await CalendarEvent.findOneAndDelete({ _id: req.params.id, category: "holiday" });
  if (!holiday) {
    return res.status(404).json({ success: false, message: "Holiday not found" });
  }
  res.json({ success: true, message: "Holiday deleted" });
});

// @desc    Export all holidays as a PDF
// @route   GET /api/holidays/export/pdf
// @access  Private
const exportHolidaysPDF = asyncHandler(async (req, res) => {
  const holidays = await CalendarEvent.find({ category: "holiday" }).populate("branches", "name").sort({ startDate: 1 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'attachment; filename="holidays.pdf"');

  const doc = new PDFDocument({ margin: 40 });
  doc.pipe(res);

  doc.fontSize(18).font("Helvetica-Bold").text("Company Holidays", { align: "center" });
  doc.moveDown(1.5);

  if (holidays.length === 0) {
    doc.fontSize(11).font("Helvetica").text("No holidays have been added yet.");
  }

  holidays.forEach((h) => {
    const dateRange =
      h.startDate.getTime() === h.endDate.getTime()
        ? formatDateLabel(h.startDate)
        : `${formatDateLabel(h.startDate)} – ${formatDateLabel(h.endDate)}`;
    const branchLabel = h.branches.length > 0 ? h.branches.map((b) => b.name).join(", ") : "All Branches";

    doc.fontSize(12).font("Helvetica-Bold").text(h.title, { continued: false });
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#555555")
      .text(`${dateRange}  •  ${CATEGORY_LABELS[h.holidayCategory] || "Uncategorized"}  •  ${branchLabel}`)
      .fillColor("#000000");
    doc.moveDown(0.8);
  });

  doc.end();
});

// @desc    Export all holidays as an iCal (.ics) file
// @route   GET /api/holidays/export/ical
// @access  Private
const exportHolidaysICal = asyncHandler(async (req, res) => {
  const holidays = await CalendarEvent.find({ category: "holiday" }).sort({ startDate: 1 });
  const ics = buildHolidaysICal(holidays);

  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="holidays.ics"');
  res.send(ics);
});

module.exports = {
  createHoliday,
  getHolidays,
  getHoliday,
  updateHoliday,
  deleteHoliday,
  exportHolidaysPDF,
  exportHolidaysICal,
};
