import { useCallback, useEffect, useState } from "react";
import { useUser } from "../hooks/useUser";
import socket from "../utils/socket";
import { useUnreadChatsContext } from "../context/UnreadChatsContext";
import useEmployees from "../hooks/useEmployees";
import { useMemo } from "react";
import useMessages from "../hooks/useMessages";

const SocketManager = () => {
  const { admins, loadingAdmins } = useMessages();
  const { user } = useUser();
  const { setUnreadForOthers, setUnreadNotifications } =
    useUnreadChatsContext();

  // handling notifications & messages
  useEffect(() => {
    if (!user?._id) return;

    if (!socket.connected) {
      socket.connect();
    }

    // join own room to receive replies
    socket.emit("join", user._id);

    // Request unread counts for all admins
    const partnerIds = (admins || []).map((a) => a._id);
    if (partnerIds.length) {
      socket.emit("request-unread", { userId: user._id, partners: partnerIds });
    }

    // Request unread notifications for current user
    socket.emit("request-unread-notification", { userId: user._id });

    socket.on("unread-counts", ({ userId, counts }) => {
      if (userId === user._id && counts) {
        setUnreadForOthers((prev) => {
          const prevKeys = Object.keys(prev || {});
          const nextKeys = Object.keys(counts || {});
          if (prevKeys.length !== nextKeys.length) return counts;
          for (let k of nextKeys) {
            if (prev[k] !== counts[k]) return counts;
          }
          return prev;
        });
      }
    });

    socket.on("unread-count", ({ userId, partnerId, count }) => {
      if (userId === user._id && partnerId) {
        setUnreadForOthers((prev) => {
          if (prev[partnerId] === count) return prev;
          const next = { ...prev, [partnerId]: count };
          return next;
        });
      }
    });

    socket.on("unread-notification-count", ({ userId: uid, count }) => {
      if (uid === user._id) {
        setUnreadNotifications((prev) => ({ ...(prev || {}), [uid]: count }));
      }
    });

    return () => {
      socket.off("unread-counts");
      socket.off("unread-count");
      socket.off("unread-notification-count");
    };
  }, [user?._id, admins]);

  return null;
};

export default SocketManager;
