const mongoose = require("mongoose");

const terminationSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    terminationType: {
      type: String,
      enum: ["performance", "misconduct", "layoff", "end_of_contract", "other"],
      required: [true, "Termination type is required"],
    },
    terminationDate: {
      type: Date,
      required: [true, "Termination date is required"],
    },
    noticeDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "finalized"],
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

module.exports = mongoose.model("Termination", terminationSchema);
