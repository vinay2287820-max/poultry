const Notification = require("../models/Notification");
const Subscription = require("../models/Subscription");
const sendPushNotification = require("../sendPushNotification");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const checkSubscription = async (req, res) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const subscription = await Subscription.findOne({ employeeId: decoded.id });

  if (!subscription) {
    return res.json({
      success: false,
      message:
        "No subscription found, Please login again to subscribe to push notifications!",
    });
  }

  return res.json({ success: true, data: subscription });
};

//  Save subscription
const saveSubscription = async (req, res) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  try {
    const { employeeId, role, subscription, browserId } = req.body;

    await Subscription.findOneAndUpdate(
      { employeeId, browserId },
      {
        role,
        browserId,
        subscription,
        // expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        expiresAt: new Date(decoded.exp * 1000),
      },
      { upsert: true, new: true }
    );

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: "Failed to save subscription" });
  }
};

const removeSubscription = async (req, res) => {
  const { endpoint } = req.body;

  await Subscription.deleteOne({ "subscription.endpoint": endpoint });

  return res.json({
    message: "Subscription removed successfully",
    success: true,
  });
};

const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ receiverId: userId });

    res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      data: notifications,
    });
  } catch (err) {
    res.json({
      success: false,
      message: "Failed to fetch notifications",
      error: err.message,
    });
  }
};

const markRead = async (req, res) => {
  const { userId } = req.params;

  try {
    const notifications = await Notification.updateMany(
      { receiverId: userId },
      { read: true }
    );

    res.status(200).json({
      success: true,
      message: "Notifications marked as read successfully",
      data: notifications,
    });
  } catch (err) {
    res.json({
      success: false,
      message: "Failed to mark notifications as read",
      error: err.message,
    });
  }
};

const clearNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.deleteMany({ receiverId: userId });

    res.status(200).json({
      success: true,
      message: "Notifications cleared successfully",
      data: notifications,
    });
  } catch (err) {
    res.json({
      success: false,
      message: "Failed to clear notifications",
      error: err.message,
    });
  }
};

const sendPush = async (req, res) => {
  try {
    const { receiverId, message, role } = req.body;
    sendPushNotification(role, { message, receiverId });
    res.json({
      success: true,
      message: "Push notification sent successfully",
    });
  } catch (err) {
    console.log(err);
    res.json({
      success: false,
      message: "Failed to send push notification",
      error: err.message,
    });
  }
};

module.exports = {
  getNotifications,
  clearNotifications,
  saveSubscription,
  removeSubscription,
  markRead,
  sendPush,
  checkSubscription,
};
