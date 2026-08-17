const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Candidate name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    // Free text by design — no Job Postings module was built alongside this,
    // so the candidate (or recruiter) just types the role applied for.
    job: {
      type: String,
      required: [true, "Job applied for is required"],
      trim: true,
    },
    source: {
      type: String,
      enum: ["referral", "linkedin", "job_board", "company_website", "walk_in", "other"],
      default: "other",
    },
    experience: {
      type: Number, // years
      default: 0,
      min: 0,
    },
    expectedSalary: {
      type: Number,
      default: null,
      min: 0,
    },
    status: {
      type: String,
      enum: ["applied", "screening", "interview", "offer", "hired", "rejected"],
      default: "applied",
    },
    convertedToEmployee: {
      type: Boolean,
      default: false,
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

candidateSchema.index({ name: "text", email: "text", job: "text" });

module.exports = mongoose.model("Candidate", candidateSchema);
