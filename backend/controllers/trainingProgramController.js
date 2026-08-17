const TrainingProgram = require("../models/TrainingProgram");
const asyncHandler = require("../utils/asyncHandler");

const POPULATE_TRAINING_TYPE = "name";

const createTrainingProgram = asyncHandler(async (req, res) => {
  const {
    name,
    trainingType,
    description,
    durationHours,
    cost,
    capacity,
    trainerType,
    trainerName,
    status,
    selfEnrollment,
    mandatory,
  } = req.body;

  const program = await TrainingProgram.create({
    name,
    trainingType,
    description,
    durationHours,
    cost: cost === "" || cost === undefined ? null : cost,
    capacity,
    trainerType,
    trainerName,
    status,
    selfEnrollment,
    mandatory,
    createdBy: req.user._id,
  });

  const populated = await program.populate("trainingType", POPULATE_TRAINING_TYPE);
  res.status(201).json({ success: true, data: populated });
});

const getTrainingPrograms = asyncHandler(async (req, res) => {
  const { search, trainingType, status, page = 1, limit = 10 } = req.query;

  const query = {};
  if (search) query.$text = { $search: search };
  if (trainingType) query.trainingType = trainingType;
  if (status) query.status = status;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [programs, total] = await Promise.all([
    TrainingProgram.find(query)
      .populate("trainingType", POPULATE_TRAINING_TYPE)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    TrainingProgram.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: programs,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

// Powers the All/Draft/Active/Completed/Cancelled tabs — always reflects
// the current search/type filter but ignores the status filter itself,
// so every tab's count stays accurate no matter which tab is selected.
// Lightweight, unpaginated list — used by Employee Trainings' Assign/Bulk
// Assign dropdowns.
const getTrainingProgramsAll = asyncHandler(async (req, res) => {
  const programs = await TrainingProgram.find({ status: { $ne: "cancelled" } })
    .sort({ name: 1 })
    .select("name trainingType")
    .populate("trainingType", "name");
  res.json({ success: true, data: programs });
});

const getTrainingProgramStatusCounts = asyncHandler(async (req, res) => {
  const { search, trainingType } = req.query;

  const baseQuery = {};
  if (search) baseQuery.$text = { $search: search };
  if (trainingType) baseQuery.trainingType = trainingType;

  const statuses = ["draft", "active", "completed", "cancelled"];
  const [total, ...statusCounts] = await Promise.all([
    TrainingProgram.countDocuments(baseQuery),
    ...statuses.map((status) => TrainingProgram.countDocuments({ ...baseQuery, status })),
  ]);

  const counts = { all: total };
  statuses.forEach((status, i) => {
    counts[status] = statusCounts[i];
  });

  res.json({ success: true, data: counts });
});

const getTrainingProgram = asyncHandler(async (req, res) => {
  const program = await TrainingProgram.findById(req.params.id)
    .populate("trainingType", POPULATE_TRAINING_TYPE)
    .populate("createdBy", "name email");

  if (!program) {
    return res.status(404).json({ success: false, message: "Training program not found" });
  }
  res.json({ success: true, data: program });
});

const updateTrainingProgram = asyncHandler(async (req, res) => {
  const {
    name,
    trainingType,
    description,
    durationHours,
    cost,
    capacity,
    trainerType,
    trainerName,
    status,
    selfEnrollment,
    mandatory,
  } = req.body;

  const program = await TrainingProgram.findByIdAndUpdate(
    req.params.id,
    {
      name,
      trainingType,
      description,
      durationHours,
      cost: cost === "" || cost === undefined ? null : cost,
      capacity,
      trainerType,
      trainerName,
      status,
      selfEnrollment,
      mandatory,
    },
    { new: true, runValidators: true }
  ).populate("trainingType", POPULATE_TRAINING_TYPE);

  if (!program) {
    return res.status(404).json({ success: false, message: "Training program not found" });
  }
  res.json({ success: true, data: program });
});

const deleteTrainingProgram = asyncHandler(async (req, res) => {
  const program = await TrainingProgram.findByIdAndDelete(req.params.id);
  if (!program) {
    return res.status(404).json({ success: false, message: "Training program not found" });
  }
  res.json({ success: true, message: "Training program deleted" });
});

module.exports = {
  createTrainingProgram,
  getTrainingPrograms,
  getTrainingProgramsAll,
  getTrainingProgramStatusCounts,
  getTrainingProgram,
  updateTrainingProgram,
  deleteTrainingProgram,
};
