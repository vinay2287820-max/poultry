import { useCallback, useEffect, useState } from "react";
import { useUser } from "../hooks/useUser";
import socket from "../utils/socket";
import { useUnreadChatsContext } from "../context/UnreadChatsContext";
import useEmployees from "../hooks/useEmployees";
import { useMemo } from "react";

const AdminSocketManager = () => {
  const { user } = useUser();
  const { setUnread, setUnreadNotifications } = useUnreadChatsContext();
  const { salesman, salesmanager, salesauthorizer, planthead, accountant } =
    useEmployees();

  const allEmployees = useMemo(
    () => [
      ...(salesman || []),
      ...(salesmanager || []),
      ...(salesauthorizer || []),
      ...(planthead || []),
      ...(accountant || []),
    ],
    [salesman, salesmanager, salesauthorizer, planthead, accountant]
  );

  const shallowEqualCounts = useCallback((a = {}, b = {}) => {
    const ak = Object.keys(a);
    const bk = Object.keys(b);
    if (ak.length !== bk.length) return false;
    for (let k of ak) {
      if (a[k] !== b[k]) return false;
    }
    return true;
  }, []);

  // handling notifications & messages
  useEffect(() => {
    if (!user?._id) return;

    socket.emit("join", user._id);

    // Request unread counts for all known employees
    const partnerIds = (allEmployees || []).map((e) => e._id);
    if (partnerIds.length) {
      socket.emit("request-unread", { userId: user._id, partners: partnerIds });
    }

    // unread counts: bulk and per-pair updates
    socket.on("unread-counts", ({ userId, counts }) => {
      if (userId === user._id && counts) {
        if (!shallowEqualCounts(counts)) {
          setUnread(counts);
        }
      }
    });

    socket.on("unread-count", ({ userId, partnerId, count }) => {
      if (userId === user._id && partnerId) {
        setUnread((prev) => {
          if (prev[partnerId] === count) return prev;
          const next = { ...prev, [partnerId]: count };
          return next;
        });
      }
    });

    socket.emit("request-unread-notification", {
      userId: user._id,
    });

    socket.on("unread-notification-count", ({ userId: uid, count }) => {
      if (uid === user._id) {
        setUnreadNotifications((prev) => ({ ...(prev || {}), [uid]: count }));
      }
    });

    // cleanup
    return () => {
      socket.off("unread-counts");
      socket.off("unread-count");
      socket.off("unread-notification-count");
    };
  }, [user?._id]);

  return null;
};

export default AdminSocketManager;
