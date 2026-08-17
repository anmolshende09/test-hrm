const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    // Stored statuses only — "Holiday", "Future", and "Attendance Not Added"
    // (from the Attendance Records spec) are DERIVED at query time in
    // getMatrix(), not stored here: Holiday comes from CalendarEvent,
    // Future/Not Added come from comparing the date to today. "Late",
    // "Early Departure", and "Overtime" remain deferred — Shifts and
    // Attendance Policies now exist (grace periods, overtime rate), but
    // nothing yet computes these labels from checkIn/checkOut against a
    // shift's expected times; that logic isn't built, only the raw data below is.
    status: {
      type: String,
      enum: ["present", "absent", "half_day", "on_leave", "day_off"],
      required: true,
    },
    // Optional actual clock times, "HH:MM" 24-hour format. Added for
    // Attendance Regularizations (a request changes these), nullable/additive
    // like `shift` on Employee — no migration risk for existing records.
    checkIn: {
      type: String,
      default: null,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Check-in must be in HH:MM 24-hour format"],
    },
    checkOut: {
      type: String,
      default: null,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Check-out must be in HH:MM 24-hour format"],
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    remarks: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// One attendance record per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
