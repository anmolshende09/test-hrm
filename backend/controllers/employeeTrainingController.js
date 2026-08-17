const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const EmployeeTraining = require("../models/EmployeeTraining");
const asyncHandler = require("../utils/asyncHandler");

const POPULATE_EMPLOYEE = "name employeeId profilePicture";
const POPULATE_PROGRAM = "name trainingType";
const POPULATE_USER = "name email";

const createEmployeeTraining = asyncHandler(async (req, res) => {
  const { employee, trainingProgram, status, assignedDate, completionDate, score, result } = req.body;

  const training = await EmployeeTraining.create({
    employee,
    trainingProgram,
    status,
    assignedDate,
    completionDate: completionDate || null,
    score: score === "" || score === undefined ? null : score,
    result: result || null,
    certificateFileName: req.file ? req.file.originalname : null,
    certificatePath: req.file ? `/uploads/training-certificates/${req.file.filename}` : null,
    assignedBy: req.user._id,
  });

  const populated = await training.populate([
    { path: "employee", select: POPULATE_EMPLOYEE },
    { path: "trainingProgram", select: POPULATE_PROGRAM, populate: { path: "trainingType", select: "name" } },
  ]);

  res.status(201).json({ success: true, data: populated });
});

// §29 — the spec's Bulk Assign modal only shows an Employees multi-select,
// but a training program has to be chosen for "the same training" to mean
// anything, so trainingProgram is required here too (a reasonable addition,
// not read directly off the screenshot).
const bulkAssignEmployeeTraining = asyncHandler(async (req, res) => {
  const { employees, trainingProgram, assignedDate } = req.body;

  if (!Array.isArray(employees) || employees.length === 0) {
    return res.status(400).json({ success: false, message: "At least one employee is required" });
  }
  if (!trainingProgram || !assignedDate) {
    return res.status(400).json({ success: false, message: "Training program and assigned date are required" });
  }

  const docs = await EmployeeTraining.insertMany(
    employees.map((employeeId) => ({
      employee: employeeId,
      trainingProgram,
      status: "enrolled",
      assignedDate,
      assignedBy: req.user._id,
    }))
  );

  res.status(201).json({ success: true, data: docs, message: `${docs.length} employees assigned` });
});

const getEmployeeTrainings = asyncHandler(async (req, res) => {
  const { search, trainingProgram, status, startDate, endDate, page = 1, limit = 10 } = req.query;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const match = {};
  if (trainingProgram) match.trainingProgram = new mongoose.Types.ObjectId(trainingProgram);
  if (status) match.status = status;
  if (startDate || endDate) {
    match.assignedDate = {};
    if (startDate) match.assignedDate.$gte = new Date(startDate);
    if (endDate) match.assignedDate.$lte = new Date(endDate);
  }

  // Aggregation (rather than find + populate) because search needs to match
  // against the joined Employee name/ID and Training Program name — fields
  // that don't live on this collection itself.
  const pipeline = [
    { $match: match },
    { $lookup: { from: "employees", localField: "employee", foreignField: "_id", as: "employee" } },
    { $unwind: "$employee" },
    { $lookup: { from: "trainingprograms", localField: "trainingProgram", foreignField: "_id", as: "trainingProgram" } },
    { $unwind: "$trainingProgram" },
    { $lookup: { from: "trainingtypes", localField: "trainingProgram.trainingType", foreignField: "_id", as: "trainingProgram.trainingType" } },
    { $unwind: { path: "$trainingProgram.trainingType", preserveNullAndEmptyArrays: true } },
  ];

  if (search) {
    const regex = new RegExp(search, "i");
    pipeline.push({
      $match: {
        $or: [{ "employee.name": regex }, { "employee.employeeId": regex }, { "trainingProgram.name": regex }],
      },
    });
  }

  pipeline.push({ $sort: { createdAt: -1 } });

  const countPipeline = [...pipeline, { $count: "total" }];
  const dataPipeline = [...pipeline, { $skip: skip }, { $limit: limitNum }];

  const [countResult, trainings] = await Promise.all([
    EmployeeTraining.aggregate(countPipeline),
    EmployeeTraining.aggregate(dataPipeline),
  ]);

  const total = countResult[0]?.total || 0;

  res.json({
    success: true,
    data: trainings,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

// Powers the All/Enrolled/In Progress/Completed tabs.
const getEmployeeTrainingStatusCounts = asyncHandler(async (req, res) => {
  const { trainingProgram } = req.query;
  const baseQuery = {};
  if (trainingProgram) baseQuery.trainingProgram = trainingProgram;

  const statuses = ["enrolled", "in_progress", "completed"];
  const [total, ...statusCounts] = await Promise.all([
    EmployeeTraining.countDocuments(baseQuery),
    ...statuses.map((status) => EmployeeTraining.countDocuments({ ...baseQuery, status })),
  ]);

  const counts = { all: total };
  statuses.forEach((status, i) => {
    counts[status] = statusCounts[i];
  });

  res.json({ success: true, data: counts });
});

const getEmployeeTraining = asyncHandler(async (req, res) => {
  const training = await EmployeeTraining.findById(req.params.id)
    .populate("employee", POPULATE_EMPLOYEE)
    .populate({ path: "trainingProgram", select: POPULATE_PROGRAM, populate: { path: "trainingType", select: "name" } })
    .populate("assignedBy", POPULATE_USER);

  if (!training) {
    return res.status(404).json({ success: false, message: "Employee training record not found" });
  }
  res.json({ success: true, data: training });
});

const updateEmployeeTraining = asyncHandler(async (req, res) => {
  const { employee, trainingProgram, status, assignedDate, completionDate, score, result } = req.body;

  const training = await EmployeeTraining.findById(req.params.id);
  if (!training) {
    return res.status(404).json({ success: false, message: "Employee training record not found" });
  }

  training.employee = employee ?? training.employee;
  training.trainingProgram = trainingProgram ?? training.trainingProgram;
  training.status = status ?? training.status;
  training.assignedDate = assignedDate ?? training.assignedDate;
  training.completionDate = completionDate || null;
  training.score = score === "" || score === undefined ? null : score;
  training.result = result || null;

  if (req.file) {
    if (training.certificatePath) {
      fs.unlink(path.join(__dirname, "..", training.certificatePath), () => {});
    }
    training.certificateFileName = req.file.originalname;
    training.certificatePath = `/uploads/training-certificates/${req.file.filename}`;
  }

  await training.save();
  const populated = await training.populate([
    { path: "employee", select: POPULATE_EMPLOYEE },
    { path: "trainingProgram", select: POPULATE_PROGRAM, populate: { path: "trainingType", select: "name" } },
  ]);

  res.json({ success: true, data: populated });
});

const deleteEmployeeTraining = asyncHandler(async (req, res) => {
  const training = await EmployeeTraining.findByIdAndDelete(req.params.id);
  if (!training) {
    return res.status(404).json({ success: false, message: "Employee training record not found" });
  }
  if (training.certificatePath) {
    fs.unlink(path.join(__dirname, "..", training.certificatePath), () => {});
  }
  res.json({ success: true, message: "Employee training record deleted" });
});

module.exports = {
  createEmployeeTraining,
  bulkAssignEmployeeTraining,
  getEmployeeTrainings,
  getEmployeeTrainingStatusCounts,
  getEmployeeTraining,
  updateEmployeeTraining,
  deleteEmployeeTraining,
};
