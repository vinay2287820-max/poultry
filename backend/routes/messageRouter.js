const express = require("express");
const {
  getAllMessages,
  getAllAdmins,
  markAsRead,
} = require("../controllers/Messages");
const messageRouter = express.Router();
const verifyToken = require("../middleware/verifyToken.js");

messageRouter.get("/:userId/:adminId", verifyToken, getAllMessages);
messageRouter.put(
  "/mark-as-read/:adminId/:employeeId/:currentUserId",
  verifyToken,
  markAsRead
);
messageRouter.get("/get-all-admins", verifyToken, getAllAdmins);

module.exports = messageRouter;
