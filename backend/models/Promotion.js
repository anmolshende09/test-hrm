const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    // Snapshotted from the employee's current designation at creation time —
    // see promotionController.createPromotion.
    previousDesignation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Designation",
      required: true,
    },
    newDesignation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Designation",
      required: [true, "New designation is required"],
    },
    promotionDate: {
      type: Date,
      default: Date.now,
    },
    effectiveDate: {
      type: Date,
      required: [true, "Effective date is required"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    documents: [{ type: String }], // relative file paths
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Promotion", promotionSchema);
