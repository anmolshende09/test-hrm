const mongoose = require("mongoose");

const resignationSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    resignationDate: {
      type: Date,
      default: Date.now,
    },
    lastWorkingDay: {
      type: Date,
      required: [true, "Last working day is required"],
    },
    // "Notice period" is deliberately NOT stored — it's computed from
    // (lastWorkingDay - resignationDate) in the controller response, so it
    // can never drift out of sync if either date is edited later.
    status: {
      type: String,
      enum: ["pending", "accepted", "withdrawn"],
      default: "pending",
    },
    documents: [{ type: String }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

resignationSchema.pre("validate", function (next) {
  if (this.resignationDate && this.lastWorkingDay && this.lastWorkingDay < this.resignationDate) {
    return next(new Error("Last working day cannot be before the resignation date"));
  }
  next();
});

module.exports = mongoose.model("Resignation", resignationSchema);
