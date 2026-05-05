const mongoose = require("mongoose");
const SalesManagerSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    phone: String,
    role: { type: String, default: "SalesManager" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SalesManager", SalesManagerSchema);
