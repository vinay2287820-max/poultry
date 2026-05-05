import { useCallback, useEffect, useRef, useState, memo, useMemo } from "react";
import axios from "axios";
import { useUser } from "../hooks/useUser.js";
import { format, isToday, isYesterday } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import Avatar from "./Avatar.jsx";

import {
  ArrowLeft,
  Check,
  CheckCheck,
  MessageCircleWarning,
  SendHorizontal,
  Smile,
  UserStar,
  X,
} from "lucide-react";
import useMessages from "../hooks/useMessages.js";
import socket from "../utils/socket.js";
import "../App.css";
import {
  Button,
  ButtonGroup,
  CircularProgress,
  IconButton,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { MyEmojiPicker } from "./EmojiPicker.jsx";
import useNotification from "../hooks/useNotification.js";
import { useTheme as useThemeContext } from "../context/ThemeContext.jsx";
import { useMediaQuery } from "@mui/material";
import { API_PATHS, BASE_URL } from "../utils/apiPaths.js";
import { useUnreadChatsContext } from "../context/UnreadChatsContext.jsx";

const Notification = ({ setIsOpenNotification }) => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const { resolvedTheme } = useThemeContext();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const token = localStorage.getItem("token");
  const { admins, loadingAdmins } = useMessages();

  const [notifications, setNotifications] = useState([]);
  const [typedMessage, setTypedMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messages, setMessages] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState({});
  const [openEmoji, setOpenEmoji] = useState(false);
  const tabType = ["notifications", "messages"];
  const { clearNotifications, loadingClearNotifications } = useNotification();
  const { unreadForOthers, setUnreadForOthers } = useUnreadChatsContext();

  const handleClearNotifications = () => {
    clearNotifications();
    setNotifications([]);
  };

  const handleEmojiSelect = (emoji) => {
    setTypedMessage((prev) => prev + emoji.emoji);
  };

  const [activeTab, setActiveTab] = useState("notifications");

  const messagesEndRef = useRef(null);
  const messagesContainerDesktopRef = useRef(null);
  const messagesContainerMobileRef = useRef(null);

  // Scroll to bottom when messages or context change
  useEffect(() => {
    const pickVisible = () => {
      const desk = messagesContainerDesktopRef.current;
      const mob = messagesContainerMobileRef.current;
      if (desk && desk.offsetParent !== null) return desk;
      if (mob && mob.offsetParent !== null) return mob;
      return desk || mob || null;
    };
    const el = pickVisible();
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight });
    });
  }, [messages, loadingMessages, activeTab]);

  // Fetch notifications history
  useEffect(() => {
    if (!user?._id) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          BASE_URL + API_PATHS.NOTIFICATIONS.GET_NOTIFICATIONS(user._id),
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const sorted = (res?.data?.data || []).slice().sort((a, b) => {
          const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tb - ta;
        });
        setNotifications(sorted);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user?._id, token]);

  // Fetch message history
  useEffect(() => {
    if (!user?._id) return;
    if (!selectedAdmin?._id) {
      setMessages([]);
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoadingMessages(true);
        const res = await axios.get(
          BASE_URL +
            API_PATHS.MESSAGES.GET_MESSAGES(user._id, selectedAdmin._id),
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setMessages(res.data.data);
        await markAsRead(selectedAdmin._id);
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchHistory();
    queryClient.invalidateQueries(["notifications", user._id]);
  }, [selectedAdmin?._id, user?._id, token, queryClient]);

  // Socket listeners
  const handleNotification = useCallback((data) => {
    const normalized = {
      ...data,
      createdAt: data?.createdAt || data?.timestamp || new Date().toISOString(),
    };
    setNotifications((prev) => [normalized, ...prev]);
  }, []);

  const handleIncomingMessage = useCallback(
    async (data) => {
      if (!data) return;
      // Only accept messages for the active conversation
      if (!selectedAdmin?._id) return;
      const involvesUser = [data.senderId, data.receiverId].includes(user?._id);
      const involvesSelectedAdmin = [data.senderId, data.receiverId].includes(
        selectedAdmin._id
      );

      if (!(involvesUser && involvesSelectedAdmin)) return;

      setMessages((prev) => {
        const exists = prev.some((msg) => {
          if (msg?._id && data?._id) return msg._id === data._id;
          const ts1 = msg?.timestamp ? new Date(msg.timestamp).getTime() : 0;
          const ts2 = data?.timestamp ? new Date(data.timestamp).getTime() : 0;
          return (
            msg.senderId === data.senderId &&
            msg.receiverId === data.receiverId &&
            msg.message === data.message &&
            ts1 === ts2
          );
        });
        if (exists) return prev;
        return [...prev, data];
      });
      const isCurrentChat = data.senderId === selectedAdmin._id;

      if (isCurrentChat) {
        markAsRead();
        socket.emit("read-messages", {
          readerId: user._id,
          partnerId: selectedAdmin._id,
        });
      }
    },
    [selectedAdmin?._id, user?._id]
  );

  useEffect(() => {
    if (!user?._id) return;

    if (!socket.connected) {
      socket.connect();
    }

    // join own room to receive replies
    socket.emit("join", user._id);

    socket.on("notification", handleNotification);
    socket.on("receiveMessage", handleIncomingMessage);
    socket.on("read-update", ({ readerId, partnerId }) => {
      if (partnerId === user._id) {
        setMessages((prev) =>
          prev.map((m) => ({
            ...m,
            read: m.senderId === user._id ? true : m.read,
          }))
        );
      }
    });
    return () => {
      socket.off("notification", handleNotification);
      socket.off("receiveMessage", handleIncomingMessage);
      socket.off("read-update");
    };
  }, [user?._id, handleNotification, handleIncomingMessage, admins]);

  // function to mark the messages as read
  const markAsRead = useCallback(async () => {
    if (!selectedAdmin?._id || !user?._id) return;
    try {
      await axios.put(
        BASE_URL +
          API_PATHS.MESSAGES.MARK_AS_READ(
            selectedAdmin._id,
            user._id,
            user._id
          ),
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // socket.emit("read-messages", {
      //   readerId: user._id,
      //   partnerId: selectedAdmin._id,
      // });

      setUnreadForOthers((prev) => ({
        ...prev,
        [selectedAdmin._id]: 0,
      }));
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  }, [selectedAdmin?._id, user?._id]);

  //mark messages as read
  useEffect(() => {
    if (selectedAdmin?._id) {
      markAsRead();
      socket.emit("read-messages", {
        readerId: user._id,
        partnerId: selectedAdmin._id,
      });
    }
  }, [selectedAdmin?._id, markAsRead, user?._id]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!selectedAdmin?._id) return;
    if (!typedMessage.trim()) return;
    const data = {
      senderId: user._id,
      senderName: user.name,
      receiverId: selectedAdmin._id,
      receiverName: selectedAdmin.name,
      message: typedMessage.trim(),
      roomId: selectedAdmin._id,
      timestamp: new Date(),
      type: "message",
    };
    socket.emit("sendMessage", data);
    setTypedMessage("");
  };

  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
  }, [messages]);

  const groupedByDate = useMemo(() => {
    return sortedMessages.reduce((groups, m) => {
      const msgDate = new Date(m.timestamp);
      const key = format(msgDate, "yyyy-MM-dd");
      const lastGroup = groups[groups.length - 1];
      if (!lastGroup || lastGroup.key !== key) {
        groups.push({ key, date: msgDate, items: [m] });
      } else {
        lastGroup.items.push(m);
      }
      return groups;
    }, []);
  }, [sortedMessages]);

  // sorted and grouped notifications (newest first)
  const sortedNotifications = useMemo(() => {
    return [...notifications].sort(
      (a, b) => new Date(b?.createdAt) - new Date(a?.createdAt)
    );
  }, [notifications]);

  const groupedByDateNotifications = useMemo(() => {
    return sortedNotifications.reduce((groups, n) => {
      const d = new Date(n?.createdAt);
      const key = format(d, "yyyy-MM-dd");
      const lastGroup = groups[groups.length - 1];
      if (!lastGroup || lastGroup.key !== key) {
        groups.push({ key, date: d, items: [n] });
      } else {
        lastGroup.items.push(n);
      }
      return groups;
    }, []);
  }, [sortedNotifications]);

  const emojiRegex =
    /^(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base}(?:\p{Emoji_Modifier})?|\p{Emoji_Component})+$/u;

  const leaveChatRoom = () => {
    setSelectedAdmin({});
    setMessages([]);
  };

  return (
    <div className="flex items-center justify-center w-full h-full absolute top-0 right-0 bg-gradient-to-b from-black/20 to-black/60 backdrop-blur-sm z-50 transition-all">
      <div className="lg:w-[65%] lg:h-[90%] md:w-[90%] md:h-[95%] sm:w-[95%] sm:h-[95%] w-[95%] h-[95%] overflow-hidden lg:p-5 md:p-5 sm:p-5 p-2 flex flex-col dark:bg-gray-800 bg-white shadow-md rounded-lg z-[9999] transition-all">
        <div className="flex items-center justify-between mb-3">
          <p className="lg:text-xl md:text-base sm:text-sm font-bold dark:text-gray-300">
            Notifications & Messages
          </p>
          <IconButton size="small" onClick={() => setIsOpenNotification(false)}>
            <CloseIcon className="text-gray-500" />
          </IconButton>
        </div>
        {/* Tab Buttons */}
        <div className="w-full mb-2">
          <ButtonGroup
            aria-label="Medium-sized button group"
            sx={{ width: "100%" }}
          >
            {tabType.map((tab, i) => (
              <Button
                disableElevation
                key={i}
                size={isMdUp ? "medium" : "small"}
                variant={activeTab === tab ? "contained" : "outlined"}
                sx={{
                  textTransform: "none",
                  width: "100%",
                }}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "notifications" ? "Notifications" : "Admin Messages"}
              </Button>
            ))}
          </ButtonGroup>
        </div>
        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="w-full flex flex-col flex-1 min-h-0">
            {loading ? (
              <div className="flex items-center justify-center w-full flex-1">
                <div className="flex items-center justify-center gap-3 bg-blue-50 p-2 rounded-lg">
                  <CircularProgress size={14} />
                  <p className="text-sm text-[#1976D2]">
                    Loading notifications...
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-y-auto w-full flex-1 mt-2 min-h-0 p-1">
                {sortedNotifications.length > 0 ? (
                  <div>
                    {groupedByDateNotifications?.map((group) => (
                      <div key={group.key}>
                        <div className="text-center sticky top-0 z-10 py-2 mb-2 lg:text-xs md:text-xs dark:text-gray-300 text-gray-600 bg-transparent">
                          <span className="bg-gray-100 dark:bg-gray-700 shadow-sm px-3 font-semibold lg:text-xs md:text-xs text-[10px] py-1 rounded-full sm:text-[10px]">
                            {isToday(group.date)
                              ? "Today"
                              : isYesterday(group.date)
                              ? "Yesterday"
                              : format(group.date, "dd MMM, yyyy")}
                          </span>
                        </div>
                        {group?.items?.map((n, i) => (
                          <div key={n?._id || `notification-${group.key}-${i}`}>
                            <div className="lg:p-3 md:p-3 sm:p-3 p-2 text-sm my-2 relative bg-gray-50 dark:bg-gray-900 border-l-4 border-[#1976D2] rounded-lg shadow-sm hover:bg-gray-100 transition-colors duration-200">
                              <div className="flex justify-between items-center">
                                <p className="text-gray-800 dark:text-gray-300 font-medium lg:text-sm md:text-xs sm:text-xs text-xs">
                                  {n?.message}
                                  {n?.createdAt && (
                                    <span
                                      className={`text-[10px] text-right absolute bottom-1 right-2 sm:text-[10px]${
                                        n?.createdAt === user._id
                                          ? "text-gray-300"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      {format(n?.createdAt, "h:mm a")}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-full text-sm lg:text-base md:text-base sm:text-base dark:text-gray-400 text-gray-500 h-full flex items-center justify-center">
                    No notifications
                  </div>
                )}
              </div>
            )}
            {sortedNotifications.length > 0 && (
              <div className="flex items-center justify-end mt-2 flex-shrink-0">
                <Button
                  startIcon={<X strokeWidth="1.8" size={17} />}
                  variant="text"
                  color="error"
                  sx={{
                    textTransform: "none",
                    padding: "4px 10px",
                    fontSize: "14px",
                    borderRadius: "999px",
                  }}
                  loading={loadingClearNotifications}
                  onClick={handleClearNotifications}
                >
                  Clear notifications
                </Button>
              </div>
            )}
          </div>
        )}
        {/* Messages Tab */}
        {activeTab === "messages" && (
          <>
            <div className="lg:flex md:flex sm:flex hidden w-full flex-1 min-h-0 overflow-hidden">
              {/* Admin List Sidebar */}
              {loadingAdmins ? (
                <div className="flex flex-col items-center justify-center w-36 flex-shrink-0 overflow-y-auto px-2 pe-6">
                  <CircularProgress size={20} />
                </div>
              ) : (
                <div className="flex flex-col items-start w-36 flex-shrink-0 overflow-y-auto custom-scrollbar px-2">
                  {admins?.map((admin) => (
                    <Button
                      key={admin._id}
                      disableElevation
                      disableRipple={selectedAdmin._id === admin._id}
                      disabled={selectedAdmin._id === admin._id}
                      variant={
                        selectedAdmin._id === admin._id ? "contained" : "text"
                      }
                      sx={{
                        textTransform: "none",
                        color:
                          selectedAdmin._id === admin._id
                            ? "white"
                            : `${
                                resolvedTheme === "dark" ? "white" : "#1f2937"
                              }`,
                        marginBottom: "5px",
                        padding: "4px 15px",
                        justifyContent: "flex-start",
                        fontSize: isMdUp ? "16px" : "13px",
                        fontWeight: "400",
                        width: "100%",
                        fontFamily: "'Inter', sans-serif",
                        "&.Mui-disabled": {
                          backgroundColor: "#1976D2",
                          color: "white",
                        },
                      }}
                      onClick={() => setSelectedAdmin(admin)}
                    >
                      {admin?.name}
                      {unreadForOthers?.[admin._id] > 0 && (
                        <span
                          className={`ml-2 text-[10px] rounded-full px-2 py-[1px] ${
                            selectedAdmin._id === admin._id
                              ? "bg-white text-[#1976D2]"
                              : "bg-[#1976D2] text-white"
                          }`}
                        >
                          {unreadForOthers[admin._id]}
                        </span>
                      )}
                    </Button>
                  ))}
                </div>
              )}

              {/* Chat Area */}
              <div className="flex-1 flex flex-col min-h-0 min-w-0">
                {/* Chat Header */}
                {selectedAdmin?._id && (
                  <div className="flex-shrink-0 border-b dark:border-b dark:border-gray-700">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 w-full flex items-center gap-2">
                      {/* <ArrowLeft
                        onClick={leaveChatRoom}
                        className="active:bg-gray-300 dark:active:bg-gray-700 dark:text-gray-400 rounded-full p-1 transition-all"
                      /> */}
                      <Avatar size={40} name={selectedAdmin?.name} />
                      <div className="flex flex-col">
                        <p className="font-semibold lg:text-base dark:text-gray-200 md:text-sm sm:text-sm">
                          {selectedAdmin.name}
                        </p>
                        <p className="text-xs dark:text-gray-300 md:text-xs">
                          {selectedAdmin.role}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages Display */}
                {loadingMessages ? (
                  <div className="flex items-center justify-center w-full h-full">
                    <div className="flex items-center justify-center gap-3 bg-blue-50 p-2 rounded-lg">
                      <CircularProgress size={14} />
                      <p className="text-sm text-[#1976D2]">Loading chats...</p>
                    </div>
                  </div>
                ) : (
                  <div
                    ref={messagesContainerDesktopRef}
                    className="p-2 overflow-y-auto custom-scrollbar dark:bg-gray-900 bg-gray-50 shadow-inner flex-1 min-h-0"
                  >
                    {sortedMessages?.length > 0 ? (
                      <div className="flex flex-col">
                        {groupedByDate?.map((group) => (
                          <div key={group.key} className="flex flex-col">
                            <div className="text-center sticky top-0 z-10 py-2 md:text-xs lg:text-sm  dark:text-gray-300 text-gray-600 bg-transparent">
                              <span className="bg-gray-200 dark:bg-gray-800 px-3 font-semibold md:text-xs sm:text-[10px] lg:text-xs py-1 rounded-full">
                                {isToday(group.date)
                                  ? "Today"
                                  : isYesterday(group.date)
                                  ? "Yesterday"
                                  : format(group.date, "dd MMM, yyyy")}
                              </span>
                            </div>
                            {group?.items?.map((m, i) => (
                              <div
                                key={`message-${m?._id || `${group.key}-${i}`}`}
                                className={`p-2 px-3 relative shadow md:text-xs lg:text-sm sm:text-xs mb-2 pe-14 max-w-[70%] 
                                            ${
                                              m?.senderId === user._id
                                                ? "bg-[#1976D2] text-white self-end rounded-xl rounded-tr-sm"
                                                : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white self-start rounded-xl rounded-tl-sm"
                                            }`}
                              >
                                <p
                                  className={
                                    `w-full break-words whitespace-pre-wrap ${
                                      m?.senderId === user._id ? "pe-4" : ""
                                    }` +
                                    (emojiRegex.test(m?.message.trim())
                                      ? `text-center lg:text-2xl text-xl ${
                                          m?.senderId === user._id ? "pe-4" : ""
                                        }`
                                      : "")
                                  }
                                >
                                  {m?.message}
                                </p>

                                {m?.timestamp && (
                                  <div
                                    className={`text-[10px] flex items-center gap-1 text-right absolute bottom-1 right-2 ${
                                      m?.senderId === user._id
                                        ? "text-gray-200"
                                        : "text-gray-500 dark:text-gray-200"
                                    }`}
                                  >
                                    {format(m.timestamp, "h:mm a")}
                                    {m?.senderId === user._id && (
                                      <p className="transition-all">
                                        {m?.read ? (
                                          <CheckCheck
                                            strokeWidth={3}
                                            size={12}
                                          />
                                        ) : (
                                          <Check strokeWidth={3} size={12} />
                                        )}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        {selectedAdmin?._id ? (
                          <div className="flex flex-col items-center text-gray-500 p-8  rounded-lg">
                            <MessageCircleWarning size={30} />
                            <h1 className="lg:text-md text-sm font-semibold mt-2">
                              Chat seems empty
                            </h1>
                            <p className="text-xs mt-1">
                              Start a conversation with {selectedAdmin?.name}
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-gray-500 p-8  rounded-lg">
                            <UserStar size={30} />
                            <h1 className="lg:text-md text-sm font-semibold mt-2">
                              No Admin Selected
                            </h1>
                            <p className="lg:text-xs text-[10px] mt-1">
                              Select an admin to start a conversation
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Input Form */}
                {selectedAdmin?._id && (
                  <div className="w-full bg-gray-100 py-2 relative flex-shrink-0 dark:bg-gray-800 dark:border-t dark:border-gray-700">
                    <Smile
                      color={openEmoji ? "#1976D2" : "gray"}
                      size={32}
                      onClick={() => setOpenEmoji(!openEmoji)}
                      className={`hidden md:block lg:block absolute top-3 left-2 cursor-pointer active:scale-95 transition-all rounded-full p-1 `}
                    />
                    <Smile
                      color={openEmoji ? "#1976D2" : "gray"}
                      size={28}
                      onClick={() => setOpenEmoji(!openEmoji)}
                      className={`md:hidden lg:hidden absolute top-2.5 left-2 cursor-pointer active:scale-95 transition-all rounded-full p-1 `}
                    />
                    <form
                      className="flex items-center gap-1 px-1"
                      onSubmit={handleSendMessage}
                    >
                      <input
                        type="text"
                        placeholder="Message"
                        className="w-full p-2 md:text-sm lg:text-base sm:text-xs px-4 rounded-full focus:outline-none ps-10 dark:bg-gray-900 dark:text-gray-200"
                        value={typedMessage}
                        onChange={(e) => setTypedMessage(e.target.value)}
                      />
                      <button
                        type="submit"
                        className="hidden md:block lg:block bg-[#1976D2] hover:bg-[#1976D2]/90 transition-all active:scale-95 rounded-full text-white p-2.5"
                      >
                        <SendHorizontal size={20} />
                      </button>
                      <button
                        type="submit"
                        className="md:hidden lg:hidden bg-[#1976D2] hover:bg-[#1976D2]/90 transition-all active:scale-95 rounded-full text-white p-2"
                      >
                        <SendHorizontal size={15} />
                      </button>
                    </form>
                    {openEmoji && (
                      <div className="absolute bottom-14 left-0 z-50">
                        <MyEmojiPicker
                          onEmojiSelect={handleEmojiSelect}
                          onClose={() => setOpenEmoji(false)}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* for mobile */}
            <div className="flex w-full flex-1 min-h-0 mt-2 sm:hidden md:hidden lg:hidden rounded-b-lg overflow-hidden">
              {/* Admin List Sidebar */}
              {loadingAdmins ? (
                <div className="flex flex-col items-center justify-center w-full flex-shrink-0 overflow-y-auto px-2 pe-6">
                  <CircularProgress size={20} />
                </div>
              ) : (
                <>
                  {!selectedAdmin?._id && (
                    <div className="flex flex-col items-start w-full flex-shrink-0 overflow-y-auto custom-scrollbar px-2">
                      {admins?.map((admin) => (
                        <Button
                          key={admin._id}
                          disableElevation
                          disableRipple={selectedAdmin._id === admin._id}
                          disabled={selectedAdmin._id === admin._id}
                          variant={
                            selectedAdmin._id === admin._id
                              ? "contained"
                              : "text"
                          }
                          sx={{
                            textTransform: "none",
                            color:
                              selectedAdmin._id === admin._id
                                ? "white"
                                : `${
                                    resolvedTheme === "dark"
                                      ? "white"
                                      : "#1f2937"
                                  }`,
                            marginBottom: "5px",
                            padding: "4px 15px",
                            justifyContent: "flex-start",
                            fontSize: "16px",
                            fontWeight: "400",
                            width: "100%",
                            fontFamily: "'Inter', sans-serif",
                            "&.Mui-disabled": {
                              backgroundColor: "#1976D2",
                              color: "white",
                            },
                          }}
                          onClick={() => setSelectedAdmin(admin)}
                        >
                          <div className="flex items-center gap-2">
                            <Avatar size={35} name={admin?.name} />
                            <p className="text-sm">{admin?.name}</p>
                            {unreadForOthers?.[admin._id] > 0 && (
                              <span
                                className={`ml-2 text-[10px] rounded-full px-2 py-[1px] ${
                                  selectedAdmin._id === admin._id
                                    ? "bg-white text-[#1976D2]"
                                    : "bg-[#1976D2] text-white"
                                }`}
                              >
                                {unreadForOthers[admin._id]}
                              </span>
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Chat Area */}
              <div className="flex-1 flex flex-col min-h-0 min-w-0">
                {/* Chat Header */}
                {selectedAdmin?._id && (
                  <div className="flex-shrink-0 border-b dark:border-b dark:border-gray-700">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 w-full flex items-center gap-2">
                      <ArrowLeft
                        onClick={leaveChatRoom}
                        className="active:bg-gray-300 dark:active:bg-gray-700 dark:text-gray-400 rounded-full p-1 transition-all"
                      />
                      <Avatar size={35} name={selectedAdmin?.name} />
                      <div className="flex flex-col">
                        <p className="font-semibold lg:text-base dark:text-gray-200 md:text-sm sm:text-sm text-sm">
                          {selectedAdmin.name}
                        </p>
                        <p className="text-xs dark:text-gray-300 md:text-xs">
                          {selectedAdmin.role}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages Display */}
                {loadingMessages ? (
                  <div className="flex items-center justify-center w-full h-full">
                    <div className="flex items-center justify-center gap-3 bg-blue-50 p-2 rounded-lg">
                      <CircularProgress size={14} />
                      <p className="lg:text-sm text-xs text-[#1976D2]">
                        Loading chats...
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    ref={messagesContainerMobileRef}
                    className="p-2 overflow-y-auto custom-scrollbar dark:bg-gray-900 bg-gray-50 shadow-inner flex-1 min-h-0"
                  >
                    {sortedMessages?.length > 0 ? (
                      <div className="flex flex-col">
                        {groupedByDate?.map((group) => (
                          <div key={group.key} className="flex flex-col">
                            <div className="text-center sticky top-0 z-10 py-2 md:text-xs lg:text-sm  dark:text-gray-300 text-gray-600 bg-transparent">
                              <span className="bg-gray-200 dark:bg-gray-800 px-3 font-semibold md:text-xs sm:text-[10px] lg:text-xs text-[10px] py-1 rounded-full">
                                {isToday(group.date)
                                  ? "Today"
                                  : isYesterday(group.date)
                                  ? "Yesterday"
                                  : format(group.date, "dd MMM, yyyy")}
                              </span>
                            </div>
                            {group?.items?.map((m, i) => (
                              <div
                                key={`message-${m?._id || `${group.key}-${i}`}`}
                                className={`p-2 px-3 relative shadow md:text-xs lg:text-sm sm:text-xs text-xs mb-2 pe-14 max-w-[70%] 
                                            ${
                                              m?.senderId === user._id
                                                ? "bg-[#1976D2] text-white self-end rounded-xl rounded-tr-sm"
                                                : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white self-start rounded-xl rounded-tl-sm"
                                            }`}
                              >
                                <p
                                  className={
                                    `w-full break-words whitespace-pre-wrap ${
                                      m?.senderId === user._id ? "pe-4" : ""
                                    }` +
                                    (emojiRegex.test(m?.message.trim())
                                      ? `text-center lg:text-2xl text-xl ${
                                          m?.senderId === user._id ? "pe-4" : ""
                                        }`
                                      : "")
                                  }
                                >
                                  {m?.message}
                                </p>

                                {m?.timestamp && (
                                  <div
                                    className={`text-[10px] flex items-center gap-1 text-right absolute bottom-1 right-2 ${
                                      m?.senderId === user._id
                                        ? "text-gray-200"
                                        : "text-gray-500 dark:text-gray-200"
                                    }`}
                                  >
                                    {format(m.timestamp, "h:mm a")}
                                    {m?.senderId === user._id && (
                                      <p className="transition-all">
                                        {m?.read ? (
                                          <CheckCheck
                                            strokeWidth={3}
                                            size={12}
                                          />
                                        ) : (
                                          <Check strokeWidth={3} size={12} />
                                        )}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        {selectedAdmin?._id ? (
                          <div className="flex flex-col items-center text-gray-500 p-8  rounded-lg">
                            <MessageCircleWarning size={30} />
                            <h1 className="text-md font-semibold mt-2">
                              Chat seems empty
                            </h1>
                            <p className="text-xs mt-1">
                              Start a conversation with {selectedAdmin?.name}
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-gray-500 p-8  rounded-lg">
                            <UserStar size={30} />
                            <h1 className="text-md font-semibold mt-2">
                              No Admin Selected
                            </h1>
                            <p className="text-xs mt-1">
                              Select an admin to start a conversation
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Input Form */}

                {selectedAdmin?._id && (
                  <div className="w-full bg-gray-100 dark:bg-gray-800 dark:border-t dark:border-gray-700 py-2 relative flex-shrink-0">
                    <Smile
                      color={openEmoji ? "#1976D2" : "gray"}
                      size={32}
                      onClick={() => setOpenEmoji(!openEmoji)}
                      className={`absolute top-3 left-2 cursor-pointer active:scale-95 transition-all rounded-full p-1 `}
                    />
                    <form
                      className="flex items-center gap-1 px-1"
                      onSubmit={handleSendMessage}
                    >
                      <input
                        type="text"
                        placeholder="Message"
                        className="w-full p-2 px-4 md:text-sm lg:text-base sm:text-xs rounded-full focus:outline-none ps-10 dark:bg-gray-900 dark:text-gray-200"
                        value={typedMessage}
                        onChange={(e) => setTypedMessage(e.target.value)}
                      />
                      <button
                        type="submit"
                        className="bg-[#1976D2] hover:bg-[#1976D2]/90 transition-all active:scale-95 rounded-full text-white p-2.5"
                      >
                        <SendHorizontal size={20} />
                      </button>
                    </form>
                    {openEmoji && (
                      <div className="absolute bottom-14 left-0 z-50">
                        <MyEmojiPicker
                          onEmojiSelect={handleEmojiSelect}
                          onClose={() => setOpenEmoji(false)}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Notification;
