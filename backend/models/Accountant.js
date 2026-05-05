const mongoose = require("mongoose");
const accountantSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    phone: String,
    role: { type: String, default: "Accountant" },
    isActive: { type: Boolean, default: true },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      unique: true,
    },

    invoices: [
      {
        order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
        invoiceDate: Date,
        amount: Number,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Accountant", accountantSchema);
