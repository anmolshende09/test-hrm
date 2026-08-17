const mongoose = require("mongoose");

const attendanceRegularizationSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    // Snapshotted from the existing Attendance record (if any) at the moment
    // the request is created — null means no check-in/out was ever recorded
    // for that day, which is itself useful context for the reviewer.
    originalCheckIn: {
      type: String,
      default: null,
    },
    originalCheckOut: {
      type: String,
      default: null,
    },
    requestedCheckIn: {
      type: String,
      required: [true, "Requested check-in time is required"],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Requested check-in must be in HH:MM 24-hour format"],
    },
    requestedCheckOut: {
      type: String,
      required: [true, "Requested check-out time is required"],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Requested check-out must be in HH:MM 24-hour format"],
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewNote: {
      type: String,
      default: "",
    },
  },
  { timestamps: true } // createdAt doubles as "Request Date" from the spec
);

module.exports = mongoose.model("AttendanceRegularization", attendanceRegularizationSchema);
