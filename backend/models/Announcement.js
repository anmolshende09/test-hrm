const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["general", "policy", "event", "urgent", "celebration"],
      default: "general",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    audienceType: {
      type: String,
      enum: ["company_wide", "branch", "department"],
      default: "company_wide",
    },
    // Only meaningful when audienceType is "branch"/"department" respectively.
    audienceBranches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
      },
    ],
    audienceDepartments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
      },
    ],
    startDate: {
      type: Date,
      default: Date.now,
    },
    // null = doesn't expire
    endDate: {
      type: Date,
      default: null,
    },
    // Relative path, e.g. /uploads/announcements/xyz.pdf
    attachment: {
      type: String,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

announcementSchema.pre("validate", function (next) {
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    return next(new Error("endDate cannot be before startDate"));
  }
  next();
});

announcementSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Announcement", announcementSchema);
