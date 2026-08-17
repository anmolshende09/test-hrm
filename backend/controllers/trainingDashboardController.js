const EmployeeTraining = require("../models/EmployeeTraining");
const asyncHandler = require("../utils/asyncHandler");

const POPULATE_EMPLOYEE = "name employeeId";
const POPULATE_PROGRAM = "name";

// §33 stat cards — reconciled against the resolved status set (Enrolled /
// In-progress / Completed): "Assigned" from the screenshot maps to
// "Enrolled" here, and "Failed" is counted from the `result` field rather
// than a workflow status, since that's where it actually lives now.
const getTrainingStats = async () => {
  const [total, completed, inProgress, enrolled, failed] = await Promise.all([
    EmployeeTraining.countDocuments(),
    EmployeeTraining.countDocuments({ status: "completed" }),
    EmployeeTraining.countDocuments({ status: "in_progress" }),
    EmployeeTraining.countDocuments({ status: "enrolled" }),
    EmployeeTraining.countDocuments({ result: "failed" }),
  ]);

  return {
    total,
    completed,
    completedRate: total > 0 ? Math.round((completed / total) * 1000) / 10 : 0,
    inProgress,
    enrolled,
    failed,
  };
};

// §34 — completion rate per training program, top 5 by total enrollment.
const getProgramCompletionRates = async () => {
  const rows = await EmployeeTraining.aggregate([
    {
      $group: {
        _id: "$trainingProgram",
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
      },
    },
    { $sort: { total: -1 } },
    { $limit: 5 },
    { $lookup: { from: "trainingprograms", localField: "_id", foreignField: "_id", as: "program" } },
    { $unwind: "$program" },
    {
      $project: {
        _id: 0,
        trainingProgram: "$_id",
        programName: "$program.name",
        total: 1,
        completed: 1,
        rate: {
          $cond: [{ $eq: ["$total", 0] }, 0, { $round: [{ $multiply: [{ $divide: ["$completed", "$total"] }, 100] }, 0] }],
        },
      },
    },
  ]);
  return rows;
};

// §35 — most recent completions.
const getRecentCompletions = () =>
  EmployeeTraining.find({ status: "completed" })
    .sort({ completionDate: -1 })
    .limit(5)
    .populate("employee", POPULATE_EMPLOYEE)
    .populate("trainingProgram", POPULATE_PROGRAM);

// §36 — soonest-starting trainings that haven't completed yet.
const getUpcomingTrainings = () =>
  EmployeeTraining.find({ status: { $in: ["enrolled", "in_progress"] } })
    .sort({ assignedDate: 1 })
    .limit(5)
    .populate("employee", POPULATE_EMPLOYEE)
    .populate("trainingProgram", POPULATE_PROGRAM);

const getTrainingDashboard = asyncHandler(async (req, res) => {
  const [stats, programCompletionRates, recentCompletions, upcomingTrainings] = await Promise.all([
    getTrainingStats(),
    getProgramCompletionRates(),
    getRecentCompletions(),
    getUpcomingTrainings(),
  ]);

  res.json({
    success: true,
    data: { stats, programCompletionRates, recentCompletions, upcomingTrainings },
  });
});

module.exports = { getTrainingDashboard };
