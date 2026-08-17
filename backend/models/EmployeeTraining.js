const mongoose = require("mongoose");

const employeeTrainingSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Employee is required"],
    },
    trainingProgram: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainingProgram",
      required: [true, "Training program is required"],
    },
    // Per the resolved decision: written-spec set only (Enrolled / In-progress
    // / Completed) — the screenshot's "Assigned" and "Failed" states were not
    // adopted here. "Failed" as a *result* still exists below on `result`,
    // decoupled from workflow status — see the `result` field comment.
    status: {
      type: String,
      enum: ["enrolled", "in_progress", "completed"],
      default: "enrolled",
    },
    assignedDate: {
      type: Date,
      required: [true, "Assigned date is required"],
    },
    completionDate: {
      type: Date,
      default: null,
    },
    score: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    // Independent of `status` — a completed training can still be failed
    // (didn't pass an assessment). This is where "Failed" from the
    // screenshots actually landed, reframed as an outcome rather than a
    // workflow state.
    result: {
      type: String,
      enum: ["passed", "failed", null],
      default: null,
    },
    certificateFileName: {
      type: String,
      default: null,
    },
    certificatePath: {
      type: String,
      default: null,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

employeeTrainingSchema.index({ employee: 1, trainingProgram: 1 });

module.exports = mongoose.model("EmployeeTraining", employeeTrainingSchema);
