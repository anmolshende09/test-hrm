const mongoose = require("mongoose");

const currencySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Currency name is required"],
      unique: true,
      trim: true,
    },

    code: {
      type: String,
      required: [true, "Currency code is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },

    symbol: {
      type: String,
      required: [true, "Currency symbol is required"],
      trim: true,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

currencySchema.index({
  name: "text",
  code: "text",
  symbol: "text",
});

module.exports = mongoose.model("Currency", currencySchema);