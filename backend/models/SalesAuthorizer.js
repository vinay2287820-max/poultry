const mongoose = require("mongoose");
const SalesAuthorizerSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    phone: String,
    role: { type: String, default: "SalesAuthorizer" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SalesAuthorizer", SalesAuthorizerSchema);
