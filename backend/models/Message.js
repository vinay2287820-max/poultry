const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  receiverId: { type: String, required: true },
  receiverName: { type: String, required: true },
  message: { type: String, required: true },
  roomId: { type: String, required: true },
  timestamp: { type: Date, required: true },
  type: { type: String, required: true },
  read: { type: Boolean, required: true, default: false },
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
