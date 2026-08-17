const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    salary: {
      type: Number,
      required: [true, "Offered salary is required"],
      min: 0,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    // The deadline for the candidate to respond — normally BEFORE startDate
    // (accept the offer, then start later), not after. No cross-field
    // validation enforced here since "expiry after start" could still be a
    // legitimate edge case (e.g. an open-ended start date).
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "withdrawn"],
      default: "pending",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true } // createdAt doubles as "Offer Date" from the spec
);

module.exports = mongoose.model("Offer", offerSchema);
