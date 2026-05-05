const webpush = require("web-push");
const Subscription = require("./models/Subscription");

const { publicKey, privateKey } = require("./vapidKey");
const { getIO } = require("./config/socket");
const Notification = require("./models/Notification");

webpush.setVapidDetails("mailto:admin@example.com", publicKey, privateKey);

const sendNotificationToRole = async (role, payload) => {
  const roles = Array.isArray(role) ? role : [role];
  if (!roles.length) return;
  const list = await Subscription.find({ role: { $in: roles } });

  const io = getIO();

  const receiverIds = Array.isArray(payload.receiverId)
    ? payload.receiverId
    : payload.receiverId
    ? [payload.receiverId]
    : [];

  const notifications = receiverIds.map((r_id) => ({
    message: payload.message,
    orderId: payload.orderId,
    type: payload.type,
    senderId: payload.senderId,
    receiverId: r_id,
    read: false,
  }));

  if (notifications.length) {
    await Notification.insertMany(notifications);
  }

  receiverIds.forEach((r_id) => {
    io.to(r_id).emit("notification", {
      orderId: payload.orderId,
      message: payload.message,
      type: payload.type,
      senderId: payload.senderId,
    });
  });

  for (let item of list) {
    try {
      await webpush.sendNotification(
        item.subscription,
        JSON.stringify(payload)
      );
    } catch (err) {
      console.log("Push failed:", err.message);
    }
  }
};

module.exports = sendNotificationToRole;
