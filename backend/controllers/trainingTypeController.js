const TrainingType = require("../models/TrainingType");
const TrainingProgram = require("../models/TrainingProgram");
const asyncHandler = require("../utils/asyncHandler");

const POPULATE_BRANCH = "name";
const POPULATE_DEPARTMENTS = "name";

// Now that TrainingProgram exists, replace the old hardcoded-0 virtual with
// a real live count, same pattern used for MediaFolder's fileCount.
const attachProgramCounts = async (trainingTypes) => {
  const counts = await TrainingProgram.aggregate([
    { $group: { _id: "$trainingType", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
  return trainingTypes.map((t) => {
    const obj = t.toObject ? t.toObject() : t;
    return { ...obj, programCount: countMap.get(String(obj._id)) || 0 };
  });
};

const createTrainingType = asyncHandler(async (req, res) => {
  const { name, description, durationHours, branch, departments } = req.body;

  const trainingType = await TrainingType.create({
    name,
    description,
    durationHours: durationHours === "" || durationHours === undefined ? null : durationHours,
    branch,
    departments: departments || [],
    createdBy: req.user._id,
  });

  const populated = await trainingType.populate([
    { path: "branch", select: POPULATE_BRANCH },
    { path: "departments", select: POPULATE_DEPARTMENTS },
  ]);

  res.status(201).json({ success: true, data: { ...populated.toObject(), programCount: 0 } });
});

const getTrainingTypes = asyncHandler(async (req, res) => {
  const { search, branch, department, page = 1, limit = 10 } = req.query;

  const query = {};
  if (search) query.$text = { $search: search };
  if (branch) query.branch = branch;
  if (department) query.departments = department;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [trainingTypes, total] = await Promise.all([
    TrainingType.find(query)
      .populate("branch", POPULATE_BRANCH)
      .populate("departments", POPULATE_DEPARTMENTS)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum),
    TrainingType.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: await attachProgramCounts(trainingTypes),
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

// Lightweight, unpaginated list — used by the Training Program form dropdown.
const getTrainingTypesAll = asyncHandler(async (req, res) => {
  const trainingTypes = await TrainingType.find().sort({ name: 1 }).select("name");
  res.json({ success: true, data: trainingTypes });
});

const getTrainingType = asyncHandler(async (req, res) => {
  const trainingType = await TrainingType.findById(req.params.id)
    .populate("branch", POPULATE_BRANCH)
    .populate("departments", POPULATE_DEPARTMENTS)
    .populate("createdBy", "name email");

  if (!trainingType) {
    return res.status(404).json({ success: false, message: "Training type not found" });
  }
  const [withCount] = await attachProgramCounts([trainingType]);
  res.json({ success: true, data: withCount });
});

const updateTrainingType = asyncHandler(async (req, res) => {
  const { name, description, durationHours, branch, departments } = req.body;

  const trainingType = await TrainingType.findByIdAndUpdate(
    req.params.id,
    {
      name,
      description,
      durationHours: durationHours === "" || durationHours === undefined ? null : durationHours,
      branch,
      departments: departments || [],
    },
    { new: true, runValidators: true }
  )
    .populate("branch", POPULATE_BRANCH)
    .populate("departments", POPULATE_DEPARTMENTS);

  if (!trainingType) {
    return res.status(404).json({ success: false, message: "Training type not found" });
  }
  res.json({ success: true, data: trainingType });
});

const deleteTrainingType = asyncHandler(async (req, res) => {
  const trainingType = await TrainingType.findByIdAndDelete(req.params.id);
  if (!trainingType) {
    return res.status(404).json({ success: false, message: "Training type not found" });
  }
  res.json({ success: true, message: "Training type deleted" });
});

module.exports = {
  createTrainingType,
  getTrainingTypes,
  getTrainingTypesAll,
  getTrainingType,
  updateTrainingType,
  deleteTrainingType,
};
