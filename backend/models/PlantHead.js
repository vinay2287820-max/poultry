const mongoose = require("mongoose");
const plantHeadSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    phone: String,
    role: { type: String, default: "PlantHead" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlantHead", plantHeadSchema);
