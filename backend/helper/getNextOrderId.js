const Counter = require("../models/Counter");

async function getNextOrderId() {
  const counter = await Counter.findOneAndUpdate(
    { name: "orderId" }, // unique counter for orders
    { $inc: { seq: 1 } }, // increment by 1
    { new: true, upsert: true } // create if doesn't exist
  );

  return String(counter.seq).padStart(5, "0"); // "00001", "00002"
}

module.exports = getNextOrderId;
