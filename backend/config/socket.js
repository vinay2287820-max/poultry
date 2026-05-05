const { Server } = require("socket.io");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const sendPushNotification = require("../sendPushNotification");
require("dotenv").config();

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "https://poultry-feed-management-software-4.onrender.com",
        "https://feedmanager.netlify.app",
        "https://anand-erp.netlify.app",
        "http://localhost:5173",
      ],
      // origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on("connection", (socket) => {
    console.log("⚡ New client connected:", socket.id);

    // Helper: compute unread count between two users
    const getUnreadCount = async (userId, partnerId) => {
      try {
        return await Message.countDocuments({
          senderId: partnerId,
          receiverId: userId,
          read: false,
        });
      } catch (e) {
        console.error("Unread count error:", e?.message || e);
        return 0;
      }
    };

    const getUnreadNotificationCount = async (userId) => {
      try {
        return await Notification.countDocuments({
          receiverId: userId,
          read: false,
        });
      } catch (e) {
        console.error("Unread count error:", e?.message || e);
        return 0;
      }
    };

    // Handle joining rooms
    socket.on("join", (roomId) => {
      socket.join(roomId);
      console.log(`📌 Socket ${socket.id} joined room ${roomId}`);
    });

    // Handle join chat room
    socket.on("joinChatRoom", (roomId) => {
      socket.join(roomId);
      console.log(`📌 employee ${socket.id} joined room ${roomId}`);
    });

    socket.on("read-messages", async ({ readerId, partnerId }) => {
      io.to(partnerId).emit("read-update", {
        readerId,
        partnerId,
      });

      // emit updated unread counts to both parties
      try {
        const forReader = await getUnreadCount(readerId, partnerId);
        const forPartner = await getUnreadCount(partnerId, readerId);
        io.to(readerId).emit("unread-count", {
          userId: readerId,
          partnerId,
          count: forReader,
        });
        io.to(partnerId).emit("unread-count", {
          userId: partnerId,
          partnerId: readerId,
          count: forPartner,
        });
      } catch (err) {
        console.log(err);
      }
    });

    // Client can request unread counts for multiple partners
    socket.on("request-unread", async ({ userId, partners }) => {
      try {
        const results = {};
        const ids = Array.isArray(partners) ? partners : [];
        for (const pid of ids) {
          results[pid] = await getUnreadCount(userId, pid);
        }
        // respond only to requesting socket
        socket.emit("unread-counts", { userId, counts: results });
      } catch (e) {
        console.error("request-unread failed:", e?.message || e);
      }
    });

    socket.on("request-unread-notification", async ({ userId }) => {
      try {
        const count = await getUnreadNotificationCount(userId);
        // respond only to requesting socket
        socket.emit("unread-notification-count", {
          userId,
          count,
        });
      } catch (e) {
        console.error("request-unread-notification failed:", e?.message || e);
      }
    });

    // Handle send messages
    socket.on("sendMessage", async (data) => {
      try {
        // Save message to database
        const message = new Message(data);
        await message.save();

        io.to(data.senderId).emit("receiveMessage", data);
        io.to(data.receiverId).emit("receiveMessage", data);

        // After a short delay, if the message is still unread, send push to receiver
        setTimeout(async () => {
          try {
            const fresh = await Message.findById(message._id).lean();
            if (fresh && fresh.read === false) {
              await sendPushNotification(null, {
                receiverId: fresh.receiverId,
                message: `${fresh.senderName}: ${fresh.message}`,
                title: "New Message",
                type: "message",
                senderId: fresh.senderId,
                messageId: fresh._id,
              });
            }
            // also emit updated unread counts immediately
            const countForReceiver = await getUnreadCount(
              data.receiverId,
              data.senderId
            );
            const countForSender = await getUnreadCount(
              data.senderId,
              data.receiverId
            );
            io.to(data.receiverId).emit("unread-count", {
              userId: data.receiverId,
              partnerId: data.senderId,
              count: countForReceiver,
            });
            io.to(data.senderId).emit("unread-count", {
              userId: data.senderId,
              partnerId: data.receiverId,
              count: countForSender,
            });
          } catch (e) {
            console.error("❌ Delayed push check failed:", e?.message || e);
          }
        }, 1000);
      } catch (error) {
        console.error("❌ Error handling message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle leaving rooms
    socket.on("leaveRoom", (roomId) => {
      socket.leave(roomId);
      console.log(`👋 Socket ${socket.id} left room ${roomId}`);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error("❌ Socket error:", error);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

// Helper function to emit notifications
const emitNotification = (userId, event, data) => {
  if (!io) {
    console.error("Socket.io not initialized!");
    return;
  }

  console.log(`📢 Emitting ${event} to user ${userId}`);
  io.to(userId).emit(event, data);
};

module.exports = { getIO, initSocket, emitNotification };
