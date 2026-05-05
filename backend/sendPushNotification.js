const webpush = require("web-push");
const Subscription = require("./models/Subscription");
const { publicKey, privateKey } = require("./vapidKey");
const mongoose = require("mongoose");

webpush.setVapidDetails("mailto:admin@example.com", publicKey, privateKey);

const sendPushNotification = async (role, payload) => {
  const roles = Array.isArray(role) ? role.filter(Boolean) : role ? [role] : [];

  // Build a flexible query: target by receiverId (employeeId) when provided; otherwise by roles
  const query = {};
  let targetedById = false;
  if (payload && payload.receiverId) {
    // Cast to ObjectId when possible to match schema
    const { receiverId } = payload;
    if (mongoose.Types.ObjectId.isValid(receiverId)) {
      const oid = new mongoose.Types.ObjectId(receiverId);
      query.$or = [{ employeeId: oid }, { employeeId: receiverId }];
      targetedById = true;
    } else {
      query.employeeId = receiverId;
      targetedById = true;
    }
  }
  if (!targetedById && roles.length) {
    query.role = { $in: roles };
  }

  // If neither receiverId nor role provided, do nothing
  if (!targetedById && !query.role) return;

  const list = await Subscription.find(query);

  if (!list || list.length === 0) {
    console.log("No subscriptions found for query", query);
    return;
  }

  const pushPayload = {
    title: payload?.title || "New Notification",
    ...payload,
  };
  if (!pushPayload.body && pushPayload.message) {
    pushPayload.body = pushPayload.message;
  }

  for (let item of list) {
    try {
      await webpush.sendNotification(
        item.subscription,
        JSON.stringify(pushPayload)
      );
    } catch (err) {
      console.log("Push failed:", err.statusCode || "", err.message);
      // Clean up expired or invalid subscriptions
      if (err.statusCode === 410 || err.statusCode === 404) {
        try {
          await Subscription.deleteOne({ _id: item._id });
          console.log("Removed stale subscription:", item._id.toString());
        } catch (cleanupErr) {
          console.log(
            "Failed to remove stale subscription:",
            cleanupErr?.message
          );
        }
      }
    }
  }
};

module.exports = sendPushNotification;
