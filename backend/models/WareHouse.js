const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
); // optional: prevent _id for subdocuments

const warehouseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },

    plantHead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlantHead",
      unique: true,
      required: true,
    },
    accountant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Accountant",
      unique: true,
      required: true,
    },

    stock: [stockSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Warehouse", warehouseSchema);
