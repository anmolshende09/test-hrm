const mongoose = require("mongoose");

// Holiday and meeting events shown on the Calendar. Leave events are NOT
// stored here — they're read directly from LeaveRequest (approved, date-range
// overlapping the query) so there's a single source of truth for leave data.
//
// This is intentionally minimal for now. When the Organization Structure
// module's full "Holidays" feature is built (branch assignment, categories,
// iCal/PDF export), this schema will be extended rather than duplicated.
const calendarEventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["holiday", "meeting"],
      required: [true, "Category is required"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    // Only meaningful when category === "holiday". Optional at the schema
    // level (not required) so the Calendar page's quick "Add Event" modal can
    // still create simple holidays without going through the full Holidays
    // management page — categorization can be added later via that page.
    holidayCategory: {
      type: String,
      enum: ["national", "company_specific", "religious", null],
      default: null,
    },
    // Which branches this holiday applies to. Empty array = applies
    // company-wide (all branches) — this is the default and matches how
    // holidays created via the simple Calendar modal behave.
    branches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

calendarEventSchema.pre("validate", function (next) {
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    return next(new Error("endDate cannot be before startDate"));
  }
  next();
});

// Speeds up the common "give me everything overlapping this visible range" query
calendarEventSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model("CalendarEvent", calendarEventSchema);
