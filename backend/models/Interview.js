const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    round: {
      type: String,
      required: [true, "Interview round is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["phone", "video", "in_person"],
      required: [true, "Interview type is required"],
    },
    scheduledAt: {
      type: Date,
      required: [true, "Date and time is required"],
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "rescheduled"],
      default: "scheduled",
    },
    // "Feedback status" from the spec is derived from this field rather than
    // stored separately — empty/absent = pending, present = submitted. Kept
    // simple (free text) since no structured scoring rubric was specified.
    feedback: {
      type: String,
      trim: true,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);
