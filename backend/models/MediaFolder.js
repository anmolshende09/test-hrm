const mongoose = require("mongoose");

const mediaFolderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Folder name is required"],
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

mediaFolderSchema.index({ name: "text" });

module.exports = mongoose.model("MediaFolder", mediaFolderSchema);