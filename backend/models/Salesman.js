const mongoose = require("mongoose");
const SalesmanSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    phone: String,
    role: { type: String, default: "Salesman" },
    collectedPayments: [
      {
        order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
        amount: Number,
        paymentMode: String,
        date: { type: Date, default: Date.now },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Salesman", SalesmanSchema);
