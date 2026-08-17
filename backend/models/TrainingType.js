const mongoose = require("mongoose");

const trainingTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Training type name is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    // Unit is not specified in the spec (§11: "Standard training duration") —
    // treated as hours, the most common convention for this kind of field.
    // Flagging this assumption; easy to relabel if it should be days instead.
    durationHours: {
      type: Number,
      default: null,
      min: 0,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: [true, "Branch is required"],
    },
    // Shown as tags in the table (§8) but not fully captured in the modal
    // screenshot — included as an optional multi-select since the table
    // examples clearly vary per record independent of Programs count.
    departments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
      },
    ],
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

trainingTypeSchema.index({ name: "text", description: "text" });

// Placeholder until the Training Program module exists — always 0 for now.
// Kept as a virtual (not a stored counter) so the API shape won't need to
// change once real programs can be counted against a training type.
trainingTypeSchema.virtual("programCount").get(function () {
  return 0;
});

module.exports = mongoose.model("TrainingType", trainingTypeSchema);
