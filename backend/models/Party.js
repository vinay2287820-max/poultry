const mongoose = require("mongoose");

const subAgentSchema = mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
});

const partySchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  contactPersonNumber: { type: String, required: true },
  address: { type: String, required: true },
  subAgents: [
    {
      type: subAgentSchema,
    },
  ],
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Salesman",
    default: null,
  },
  approved: { type: Boolean, required: true, default: false },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    default: null,
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    default: null,
  },
  partyStatus: {
    type: String,
    enum: ["pending", "sentForApproval", "approved", "rejected"],
    default: "pending",
  },
  limit: {
    type: Number,
    required: true,
  },
});

const Party = mongoose.model("Party", partySchema);
module.exports = Party;
