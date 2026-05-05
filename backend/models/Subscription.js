const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema({
  employeeId: mongoose.Schema.Types.ObjectId,
  role: String,
  subscription: Object,
  browserId: String,
  expiresAt: {
    type: Date,
    index: { expires: 0 }, // TTL index
  },
});

module.exports = mongoose.model("Subscription", SubscriptionSchema);
