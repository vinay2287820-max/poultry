const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const notificationRouter = express.Router();
const {
  getNotifications,
  clearNotifications,
  saveSubscription,
  removeSubscription,
  markRead,
  sendPush,
  checkSubscription,
} = require("../controllers/Notification");

notificationRouter.get("/:userId", verifyToken, getNotifications);
notificationRouter.post("/save-subscription", verifyToken, saveSubscription);
notificationRouter.post(
  "/remove-subscription",
  verifyToken,
  removeSubscription
);
notificationRouter.delete(
  "/clearNotifications",
  verifyToken,
  clearNotifications
);
notificationRouter.put("/mark-read/:userId", verifyToken, markRead);
notificationRouter.get("/check-subscription", verifyToken, checkSubscription);
notificationRouter.post("/send-push", verifyToken, sendPush);

module.exports = notificationRouter;
