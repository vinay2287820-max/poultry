const Admin = require("../models/Admin.js");
const Message = require("../models/Message.js");
const { client } = require("../config/redis.js");

const getAllMessages = async (req, res) => {
  try {
    const { userId, adminId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: adminId, receiverId: userId },
        { senderId: userId, receiverId: adminId },
      ],
    }).sort({ timestamp: 1 });

    return res.status(200).json({
      data: messages,
      success: true,
      message: "Messages fetched from MongoDB",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: err.message,
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { adminId, employeeId, currentUserId } = req.params;

    // Wo user jisne message read kiya hai
    const readerId = currentUserId;

    const messageFrom = readerId === adminId ? employeeId : adminId;

    const messageTo = readerId;

    const result = await Message.updateMany(
      {
        senderId: messageFrom,
        receiverId: messageTo,
        read: false,
      },
      { read: true }
    );

    return res.status(200).json({
      success: true,
      data: result,
      message: "Messages marked as read",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
      error: err.message,
    });
  }
};

const getAllAdmins = async (req, res) => {
  const admins = await Admin.find();
  res
    .status(200)
    .json({ data: admins, message: "Fetched all admins", success: true });
};

module.exports = { getAllMessages, getAllAdmins, markAsRead };
