const Announcement = require("../models/Announcement");
const asyncHandler = require("../utils/asyncHandler");
const { getAnnouncementAudienceQuery } = require("../utils/audienceFilter");

// FormData sends repeated keys (audienceBranches, audienceBranches, ...) as
// an array already via multer/busboy, but a single selection arrives as a
// plain string — normalize both shapes to an array.
const parseArrayField = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const parseFeatured = (value) => value === "true" || value === true;

// @desc    Create an announcement
// @route   POST /api/announcements
// @access  Private (admin, hr_manager)
const createAnnouncement = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    priority,
    featured,
    audienceType,
    audienceBranches,
    audienceDepartments,
    startDate,
    endDate,
  } = req.body;

  const announcement = await Announcement.create({
    title,
    description,
    category,
    priority,
    featured: parseFeatured(featured),
    audienceType,
    audienceBranches: audienceType === "branch" ? parseArrayField(audienceBranches) : [],
    audienceDepartments: audienceType === "department" ? parseArrayField(audienceDepartments) : [],
    startDate,
    endDate: endDate || null,
    attachment: req.file ? `/uploads/announcements/${req.file.filename}` : null,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: announcement });
});

// @desc    Get announcements — audience-filtered for Employees, unrestricted
//          for Admin/HR Manager (who are managing them, not just reading).
//          Sorted featured-first, then most recent.
// @route   GET /api/announcements?search=&category=&priority=&featured=&page=&limit=
// @access  Private
const getAnnouncements = asyncHandler(async (req, res) => {
  const { search, category, priority, featured, page = 1, limit = 10 } = req.query;

  const audienceQuery = await getAnnouncementAudienceQuery(req.user);
  const query = { ...audienceQuery };
  if (search) query.$text = { $search: search };
  if (category) query.category = category;
  if (priority) query.priority = priority;
  if (featured !== undefined) query.featured = featured === "true";

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [announcements, total] = await Promise.all([
    Announcement.find(query)
      .populate("createdBy", "name")
      .populate("audienceBranches", "name")
      .populate("audienceDepartments", "name")
      .sort({ featured: -1, startDate: -1 })
      .skip(skip)
      .limit(limitNum),
    Announcement.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: announcements,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

// @desc    Get a single announcement
// @route   GET /api/announcements/:id
// @access  Private
const getAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id)
    .populate("createdBy", "name")
    .populate("audienceBranches", "name")
    .populate("audienceDepartments", "name");
  if (!announcement) {
    return res.status(404).json({ success: false, message: "Announcement not found" });
  }
  res.json({ success: true, data: announcement });
});

// @desc    Update an announcement
// @route   PUT /api/announcements/:id
// @access  Private (admin, hr_manager)
const updateAnnouncement = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    priority,
    featured,
    audienceType,
    audienceBranches,
    audienceDepartments,
    startDate,
    endDate,
  } = req.body;

  const payload = {
    title,
    description,
    category,
    priority,
    featured: parseFeatured(featured),
    audienceType,
    audienceBranches: audienceType === "branch" ? parseArrayField(audienceBranches) : [],
    audienceDepartments: audienceType === "department" ? parseArrayField(audienceDepartments) : [],
    startDate,
    endDate: endDate || null,
  };
  if (req.file) {
    payload.attachment = `/uploads/announcements/${req.file.filename}`;
  }

  const announcement = await Announcement.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });
  if (!announcement) {
    return res.status(404).json({ success: false, message: "Announcement not found" });
  }
  res.json({ success: true, data: announcement });
});

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Private (admin, hr_manager)
const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findByIdAndDelete(req.params.id);
  if (!announcement) {
    return res.status(404).json({ success: false, message: "Announcement not found" });
  }
  res.json({ success: true, message: "Announcement deleted" });
});

module.exports = {
  createAnnouncement,
  getAnnouncements,
  getAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
