const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "broiler starter feed",
        "broiler grower feed",
        "broiler finisher feed",
        "layer starter feed",
        "layer grower feed",
        "layer finisher feed",
        "layer mash",
        "concentrates & premixes",
        "supplements",
        "additives",
        "grains",
        "protein meals",
        "other",
      ],
      required: true,
    },
    description: String,
    price: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
