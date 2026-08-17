const mongoose = require("mongoose");

const trainingProgramSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Program name is required"],
      trim: true,
    },
    trainingType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainingType",
      required: [true, "Training type is required"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    durationHours: {
      type: Number,
      required: [true, "Duration is required"],
      min: 0,
    },
    cost: {
      type: Number,
      default: null,
      min: 0,
    },
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: 1,
    },
    // §24/§35 — Trainer is required by the written spec, but no UI control is
    // shown, so this is a reasonable minimal interpretation: pick internal
    // or external, then name the trainer/provider as free text.
    trainerType: {
      type: String,
      enum: ["internal", "external"],
      default: "internal",
    },
    trainerName: {
      type: String,
      trim: true,
      required: [true, "Trainer name is required"],
    },
    status: {
      type: String,
      enum: ["draft", "active", "completed", "cancelled"],
      default: "draft",
    },
    selfEnrollment: {
      type: Boolean,
      default: false,
    },
    mandatory: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

trainingProgramSchema.index({ name: "text", description: "text" });

// Placeholders until Session management and Employee Training modules exist
// (§29/§30 — both explicitly out of scope for now). Kept as virtuals so the
// API shape is stable and won't need to change once those are built.
trainingProgramSchema.virtual("sessionCount").get(function () {
  return 0;
});
trainingProgramSchema.virtual("employeeCount").get(function () {
  return 0;
});

module.exports = mongoose.model("TrainingProgram", trainingProgramSchema);