import { useEffect, useState, useCallback, useMemo, useRef, memo } from "react";
import axios from "axios";
import { useUser } from "../hooks/useUser.js";
import {
  Button,
  ButtonGroup,
  CircularProgress,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import useEmployees from "../hooks/useEmployees.js";
import Avatar from "./Avatar.jsx";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  MessageCircleWarning,
  SendHorizontal,
  Smile,
  X,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import socket from "../utils/socket.js";
import { format, isToday, isYesterday } from "date-fns";
import "../App.css";
import { MyEmojiPicker } from "./EmojiPicker.jsx";
import useNotification from "../hooks/useNotification.js";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme as MyTheme } from "../context/ThemeContext.jsx";
import { API_PATHS, BASE_URL } from "../utils/apiPaths.js";
import { useUnreadChatsContext } from "../context/UnreadChatsContext.jsx";

const AdminNotification = ({ setIsOpenNotification }) => {
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const { resolvedTheme } = MyTheme();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const token = localStorage.getItem("token");
  const { salesman, salesmanager, salesauthorizer, planthead, accountant } =
    useEmployees();

  const [selectedTab, setSelectedTab] = useState("all-dashboards");
  const [selectedDashboard, setSelectedDashboard] = useState("All");

  const [typedMessage, setTypedMessage] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [openEmoji, setOpenEmoji] = useState(false);
  const { clearNotifications, loadingClearNotifications } = useNotification();
  const [activeTab, setActiveTab] = useState("notifications");
  const tabType = ["notifications", "messages"];
  const { unread } = useUnreadChatsContext();

  const messagesEndRef = useRef(null);
  const messagesContainerDesktopRef = useRef(null);
  const messagesContainerMobileRef = useRef(null);

  const handleClearNotifications = () => {
    clearNotifications();
    setNotifications([]);
  };

  // Memoize emoji select handler
  const handleEmojiSelect = useCallback((emoji) => {
    setTypedMessage((prev) => prev + emoji.emoji);
  }, []);

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

  // Memoize all employees array - FIXED: Added stable dependencies
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

  // Memoize selected employee - FIXED: Only recalculate when necessary
  const selectedEmployee = useMemo(() => {
    if (selectedTab === "all-dashboards" || !selectedTab) return null;
    return allEmployees.find((e) => e._id === selectedTab) || null;
  }, [selectedTab, allEmployees]);

  const joinChatRoom = useCallback(
    (empId) => {
      setSelectedTab(empId);
      setSelectedDashboard("");
      setMessages([]);

      if (currentRoomId && currentRoomId !== empId) {
        socket.emit("leaveRoom", currentRoomId);
      }

      socket.emit("joinChatRoom", empId);
      setCurrentRoomId(empId);
    },
    [currentRoomId]
  );

  const leaveChatRoom = useCallback(() => {
    setSelectedTab(null);
    setCurrentRoomId(null);
    if (currentRoomId) {
      socket.emit("leaveRoom", currentRoomId);
    }
    setMessages([]);
  }, [currentRoomId]);

  // Stable handlers to avoid duplicate bindings
  const handleNotification = useCallback((data) => {
    const normalized = {
      ...data,
      createdAt: data?.createdAt || data?.timestamp || new Date().toISOString(),
    };
    setNotifications((prev) => {
      const exists = prev.some(
        (n) =>
          n._id === normalized._id ||
          (n.message === normalized.message &&
            Math.abs(
              new Date(n.createdAt).getTime() -
                new Date(normalized.createdAt).getTime()
            ) < 1000)
      );

      if (exists) return prev;
      return [normalized, ...prev];
    });
  }, []);

  const handleMessage = useCallback(
    async (data) => {
      if (!data) return;

      const involvesAdmin = [data.senderId, data.receiverId].includes(
        user?._id
      );
      if (!involvesAdmin) return;

      if (
        selectedEmployee &&
        selectedEmployee !== "all-dashboards" &&
        ![data.senderId, data.receiverId].includes(selectedEmployee._id)
      ) {
        return;
      }

      setMessages((prev) => {
        const messageExists = prev.some((msg) => {
          const ts1 = msg?.timestamp ? new Date(msg.timestamp).getTime() : 0;
          const ts2 = data?.timestamp ? new Date(data.timestamp).getTime() : 0;
          return (
            msg.senderId === data.senderId &&
            msg.receiverId === data.receiverId &&
            msg.message === data.message &&
            ts1 === ts2
          );
        });
        if (messageExists) return prev;
        return [...prev, data];
      });

      const isCurrentChat = data?.senderId === selectedEmployee?._id;

      if (isCurrentChat) {
        markAsRead();
        socket.emit("read-messages", {
          readerId: user._id,
          partnerId: selectedEmployee._id,
        });
        socket.emit("count-unread", {
          readerId: user._id,
          partnerId: selectedEmployee._id,
        });
      }
    },
    [user?._id, selectedEmployee]
  );

  // function to mark the messages as read - MEMOIZED
  const markAsRead = useCallback(async () => {
    if (!selectedEmployee || !user?._id) return;
    try {
      const res = await axios.put(
        BASE_URL +
          API_PATHS.MESSAGES.MARK_AS_READ(
            user._id,
            selectedEmployee._id,
            user._id
          ),
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }, [selectedEmployee, user?._id]);

  //mark messages as read
  useEffect(() => {
    if (selectedEmployee?._id) {
      markAsRead();
      socket.emit("read-messages", {
        readerId: user._id,
        partnerId: selectedEmployee._id,
      });
    }
  }, [selectedEmployee?._id, markAsRead, user?._id]);

  // MEMOIZED: Handle send message
  const handleSendMessage = useCallback(
    (e) => {
      e.preventDefault();

      if (!typedMessage.trim()) return;

      const data = {
        senderId: user._id,
        senderName: user.name,
        receiverId: selectedEmployee._id,
        receiverName: selectedEmployee.name,
        message: typedMessage.trim(),
        roomId: selectedEmployee._id || selectedDashboard,
        timestamp: new Date(),
        type: "message",
      };

      socket.emit("sendMessage", data);
      setTypedMessage("");
    },
    [typedMessage, user, selectedEmployee, selectedDashboard]
  );

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
    queryClient.invalidateQueries(["notifications", user._id]);
  }, [user?._id, token, queryClient]);

  // Fetch message history
  useEffect(() => {
    if (!user?._id) return;
    if (!selectedEmployee || selectedEmployee === "all-dashboards") {
      setMessages([]);
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoadingMessages(true);
        const res = await axios.get(
          BASE_URL +
            API_PATHS.MESSAGES.GET_MESSAGES(user._id, selectedEmployee._id),
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setMessages(res.data.data);
        await markAsRead(selectedEmployee._id);
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchHistory();
    queryClient.invalidateQueries(["notifications", user?._id]);
  }, [selectedEmployee, user?._id, token, queryClient]);

  // handling notifications & messages
  useEffect(() => {
    if (!user?._id) return;

    socket.emit("join", user._id);

    const handleReadUpdate = ({ readerId, partnerId }) => {
      if (partnerId === user._id) {
        setMessages((prev) =>
          prev.map((m) => ({
            ...m,
            read: m.senderId === user._id ? true : m.read,
          }))
        );
      }
    };

    socket.on("notification", handleNotification);
    socket.on("receiveMessage", handleMessage);
    socket.on("read-update", handleReadUpdate);

    return () => {
      socket.off("notification", handleNotification);
      socket.off("receiveMessage", handleMessage);
      socket.off("read-update", handleReadUpdate);
    };
  }, [user?._id, handleNotification, handleMessage]);

  // MEMOIZED: Sorted messages
  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
  }, [messages]);

  // MEMOIZED: Grouped by date
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

  // MEMOIZED: Sorted notifications
  const sortedNotifications = useMemo(() => {
    return [...notifications].sort(
      (a, b) => new Date(b?.createdAt) - new Date(a?.createdAt)
    );
  }, [notifications]);

  // MEMOIZED: Grouped notifications
  const groupedByDateNotifications = useMemo(() => {
    return sortedNotifications.reduce((groups, m) => {
      const msgDate = new Date(m?.createdAt);
      const key = format(msgDate, "yyyy-MM-dd");
      const lastGroup = groups[groups.length - 1];
      if (!lastGroup || lastGroup.key !== key) {
        groups.push({ key, date: msgDate, items: [m] });
      } else {
        lastGroup.items.push(m);
      }
      return groups;
    }, []);
  }, [sortedNotifications]);

  const emojiRegex =
    /^(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base}(?:\p{Emoji_Modifier})?|\p{Emoji_Component})+$/u;

  // Employee list component - FULLY MEMOIZED
  const EmployeeList = memo(({ title, employees }) => (
    <div className="flex flex-col items-start w-full px-2 transition-all">
      <p className="text-gray-500 lg:text-sm sm:text-xs text-[10px] mb-1 dark:text-gray-400 md:text-[11px]">
        {title}
      </p>
      {employees?.map((emp) => (
        <Button
          key={emp._id}
          disableElevation
          disableRipple={selectedTab === emp._id}
          disabled={selectedTab === emp._id}
          variant={selectedTab === emp._id ? "contained" : "text"}
          sx={{
            textTransform: "none",
            color:
              selectedTab === emp._id
                ? "white"
                : `${resolvedTheme === "dark" ? "white" : "#1f2937"}`,
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
          onClick={joinChatRoom.bind(null, emp._id)}
        >
          <div className="flex items-center justify-between w-full">
            <span>{emp.name}</span>
            {unread?.[emp._id] > 0 && (
              <span className="ml-2 text-[10px] rounded-full bg-[#1976D2] text-white px-2 py-[1px]">
                {unread[emp._id]}
              </span>
            )}
          </div>
        </Button>
      ))}
    </div>
  ));

  // Employee list component for mobile - FULLY MEMOIZED
  const EmployeeListForMobile = memo(({ title, employees }) => (
    <div className="flex flex-col items-start w-full px-2 transition-all">
      <p className="text-gray-500 lg:text-sm sm:text-xs text-[10px] mb-1 dark:text-gray-400 md:text-[11px]">
        {title}
      </p>
      {employees?.map((emp) => (
        <Button
          key={emp._id}
          disableElevation
          disableRipple={selectedTab === emp._id}
          disabled={selectedTab === emp._id}
          variant={selectedTab === emp._id ? "contained" : "text"}
          sx={{
            textAlign: "center",
            textTransform: "none",
            color:
              selectedTab === emp._id
                ? "white"
                : `${resolvedTheme === "dark" ? "white" : "#1f2937"}`,
            marginBottom: "5px",
            padding: "4px 15px",
            justifyContent: "flex-start",
            fontSize: isMdUp ? "16px" : "14px",
            fontWeight: "400",
            width: "100%",
            fontFamily: "'Inter', sans-serif",
            "&.Mui-disabled": {
              backgroundColor: "#1976D2",
              color: "white",
            },
          }}
          onClick={joinChatRoom.bind(null, emp._id)}
        >
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2">
              <Avatar size={35} name={emp?.name} />
              <p>{emp?.name}</p>
            </div>
            {unread?.[emp._id] > 0 && (
              <span className="ml-2 text-[10px] rounded-full bg-[#1976D2] text-white px-2 py-[1px]">
                {unread[emp._id]}
              </span>
            )}
          </div>
        </Button>
      ))}
    </div>
  ));

  return (
    <div className="flex items-center justify-center w-full h-full absolute top-0 right-0 bg-gradient-to-b from-black/20 to-black/60 backdrop-blur-sm z-50 transition-all">
      <div className="lg:w-[65%] lg:h-[90%] md:w-[90%] md:h-[95%] sm:w-[95%] sm:h-[95%] w-[95%] h-[95%] dark:bg-gray-800 overflow-hidden lg:p-5 md:p-5 sm:p-5 p-2 flex items-start flex-col bg-white shadow-md rounded-lg z-[9999] transition-all">
        {/* Header - Fixed height */}
        <div className="flex items-center justify-between mb-3 sm:mb-2 w-full flex-shrink-0 ">
          <p className="lg:text-xl md:text-base sm:text-sm font-bold dark:text-gray-300">
            Notifications & Chats
          </p>
          <IconButton size="small" onClick={() => setIsOpenNotification(false)}>
            <CloseIcon className="text-gray-500" />
          </IconButton>
        </div>

        {user?.role === "Admin" && (
          <div className="w-full flex-1 flex flex-col min-h-0">
            {/* Tab Buttons - Fixed height */}
            <div className="w-full flex-shrink-0">
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
                    {tab === "notifications" ? "Notifications" : "Chats"}
                  </Button>
                ))}
              </ButtonGroup>
            </div>

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="w-full flex flex-col flex-1 mt-2 min-h-0">
                {/* Scrollable notifications */}
                <div className="flex-1 overflow-y-auto rounded-xl min-h-0 p-1">
                  {!loading ? (
                    <div>
                      {sortedNotifications?.length === 0 ? (
                        <div className="w-full dark:text-gray-400 md:h-[400px] lg:h-[450px] text-gray-500 flex items-center justify-center">
                          No notifications
                        </div>
                      ) : (
                        groupedByDateNotifications?.map((group, i) => (
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
                              <div
                                key={n?._id || `notification-${group.key}-${i}`}
                              >
                                <div className="lg:p-3 md:p-3 sm:p-3 p-2 text-sm my-2 relative bg-gray-50 dark:bg-gray-900 border-l-4 border-[#1976D2] rounded-lg shadow-sm hover:bg-gray-100 transition-colors duration-200">
                                  <div className="flex justify-between items-center">
                                    <p className="text-gray-800 dark:text-gray-300 font-medium lg:text-sm md:text-xs sm:text-xs text-xs me-10">
                                      {n?.message}
                                      {n?.createdAt && (
                                        <span
                                          className={`text-[10px] text-right absolute bottom-1 right-2 sm:text-[10px] ${
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
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="flex w-full h-full items-center justify-center">
                      <CircularProgress />
                    </div>
                  )}
                </div>
                {sortedNotifications.length > 0 && (
                  <div className="flex items-center justify-end mt-2 flex-shrink-0">
                    <Button
                      startIcon={<X strokeWidth="1.8" size={17} />}
                      variant="text"
                      color="error"
                      sx={{
                        textTransform: "none",
                        padding: "4px 10px",
                        fontSize: isMdUp ? "14px" : "12px",
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
                <div className="lg:flex md:flex sm:flex hidden w-full flex-1 min-h-0 mt-2">
                  {/* Employee List Sidebar */}
                  <div className="overflow-y-auto custom-scrollbar lg:min-w-48 md:min-w-40 border-gray-200 flex-shrink-0">
                    <div className="flex flex-col items-start gap-2 w-full px-2">
                      <EmployeeList title="Salesmen" employees={salesman} />
                      <EmployeeList title="Managers" employees={salesmanager} />
                      <EmployeeList
                        title="Authorizers"
                        employees={salesauthorizer}
                      />
                      <EmployeeList title="Plant Heads" employees={planthead} />
                      <EmployeeList
                        title="Accountants"
                        employees={accountant}
                      />
                    </div>
                  </div>

                  {/* Chat Area */}
                  {selectedEmployee ? (
                    <div className="w-full flex-1 flex flex-col min-h-0 min-w-0">
                      {/* Header - Fixed */}
                      <div className="flex-shrink-0 border-b dark:border-b dark:border-gray-700">
                        <div className="p-2 bg-gray-50 dark:bg-gray-800 w-full flex items-center gap-2">
                          <Avatar
                            size={isSmDown ? 20 : 40}
                            name={selectedEmployee?.name}
                          />

                          <div className="flex flex-col">
                            <p className="font-semibold lg:text-base dark:text-gray-200 md:text-sm sm:text-sm">
                              {selectedEmployee?.name}
                            </p>
                            <p className="text-xs dark:text-gray-300 md:text-xs">
                              {selectedEmployee.role}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Messages Area - Scrollable */}
                      {loadingMessages ? (
                        <div className="flex items-center justify-center w-full flex-1">
                          <div className="flex items-center justify-center gap-3 bg-blue-50 dark:bg-blue-950 p-2 rounded-lg">
                            <CircularProgress size={14} />
                            <p className="lg:text-sm md:text-xs text-[#1976D2]">
                              Loading chats...
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div
                          ref={messagesContainerDesktopRef}
                          className="p-2 dark:bg-gray-900 overflow-y-auto custom-scrollbar bg-gray-50 shadow-inner flex-1 min-h-0 relative"
                        >
                          {sortedMessages?.length > 0 ? (
                            <div className="flex flex-col">
                              {groupedByDate?.map((group) => (
                                <div key={group.key} className="flex flex-col">
                                  <div className="text-center sticky top-0 z-10 py-2 md:text-xs lg:text-sm dark:text-gray-300 text-gray-600 bg-transparent">
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
                                      key={`message-${
                                        m?._id || `${group.key}-${i}`
                                      }`}
                                      className={`p-2 px-3 text-gray-800 shadow md:text-xs lg:text-sm sm:text-xs mb-2 pe-14 rounded-xl relative max-w-[70%]
                            ${
                              m?.senderId === user._id
                                ? "bg-[#1976D2] text-white self-end rounded-xl rounded-tr-sm"
                                : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white self-start rounded-xl rounded-tl-sm"
                            }`}
                                    >
                                      <p
                                        className={
                                          `w-full break-words whitespace-pre-wrap ${
                                            m?.senderId === user._id
                                              ? "pe-4"
                                              : ""
                                          }` +
                                          (emojiRegex.test(m?.message.trim())
                                            ? `text-center lg:text-2xl text-xl ${
                                                m?.senderId === user._id
                                                  ? "pe-4"
                                                  : ""
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
                                                <Check
                                                  strokeWidth={3}
                                                  size={12}
                                                />
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
                              <div className="flex flex-col items-center text-gray-500 p-8  rounded-lg">
                                <MessageCircleWarning size={30} />
                                <h1 className="text-md font-semibold mt-2">
                                  Chat seems empty
                                </h1>
                                <p className="text-xs mt-1">
                                  Start a conversation with{" "}
                                  {selectedDashboard || selectedEmployee?.name}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Input Area  */}
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
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <div className="flex flex-col items-center text-gray-500 p-8  rounded-lg">
                        <MessageCircleWarning size={30} />
                        <h1 className="text-sm font-semibold mt-2">
                          No conversation selected
                        </h1>
                        <p className="text-xs mt-1">
                          Please choose an employee to view messages
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* for mobile */}
                <div className="flex w-full flex-1 min-h-0 mt-2 sm:hidden md:hidden lg:hidden rounded-b-lg overflow-hidden">
                  {/* Employee List Sidebar */}
                  {!selectedEmployee && (
                    <div className="overflow-y-auto custom-scrollbar w-full flex-shrink-0">
                      <div className="flex flex-col items-start gap-2 w-full px-2">
                        <EmployeeListForMobile
                          title="Salesmen"
                          employees={salesman}
                        />
                        <EmployeeListForMobile
                          title="Managers"
                          employees={salesmanager}
                        />
                        <EmployeeListForMobile
                          title="Authorizers"
                          employees={salesauthorizer}
                        />
                        <EmployeeListForMobile
                          title="Plant Heads"
                          employees={planthead}
                        />
                        <EmployeeListForMobile
                          title="Accountants"
                          employees={accountant}
                        />
                      </div>
                    </div>
                  )}

                  {/* Chat Area */}
                  {selectedEmployee ? (
                    <div className="w-full flex-1 flex flex-col min-h-0 min-w-0">
                      {/* Header - Fixed */}
                      <div className="flex-shrink-0 border-b dark:border-b dark:border-gray-700">
                        <div className="p-2 bg-gray-50 dark:bg-gray-800 w-full flex items-center gap-2">
                          <ArrowLeft
                            onClick={leaveChatRoom}
                            className="active:bg-gray-300 dark:active:bg-gray-700 dark:text-gray-400 rounded-full p-1 transition-all"
                          />
                          <Avatar
                            size={isSmDown ? 35 : 40}
                            name={selectedEmployee?.name}
                          />

                          <div className="flex flex-col">
                            <p className="font-semibold lg:text-base dark:text-gray-200 md:text-sm sm:text-sm text-sm">
                              {selectedEmployee?.name}
                            </p>
                            <p className="text-xs dark:text-gray-300 md:text-xs">
                              {selectedEmployee.role}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Messages Area - Scrollable */}
                      {loadingMessages ? (
                        <div className="flex items-center justify-center w-full flex-1">
                          <div className="flex items-center justify-center gap-3 bg-blue-50 dark:bg-blue-950 p-2 rounded-lg">
                            <CircularProgress size={14} />
                            <p className="lg:text-sm md:text-xs text-xs text-[#1976D2]">
                              Loading chats...
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div
                          ref={messagesContainerMobileRef}
                          className="p-2 dark:bg-gray-900 overflow-y-auto custom-scrollbar bg-gray-50 shadow-inner flex-1 min-h-0 relative"
                        >
                          {sortedMessages?.length > 0 ? (
                            <div className="flex flex-col">
                              {groupedByDate?.map((group) => (
                                <div key={group.key} className="flex flex-col">
                                  <div className="text-center sticky top-0 z-10 py-2 md:text-xs lg:text-sm dark:text-gray-300 text-gray-600 bg-transparent">
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
                                      key={`message-${
                                        m?._id || `${group.key}-${i}`
                                      }`}
                                      className={`p-2 px-3 text-gray-800 shadow md:text-xs lg:text-sm sm:text-xs text-xs mb-2 pe-14 rounded-xl relative max-w-[70%] 
                            ${
                              m?.senderId === user._id
                                ? "bg-[#1976D2] text-white self-end rounded-xl rounded-tr-sm"
                                : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white self-start rounded-xl rounded-tl-sm"
                            }`}
                                    >
                                      <p
                                        className={
                                          `w-full break-words whitespace-pre-wrap ${
                                            m?.senderId === user._id
                                              ? "pe-4"
                                              : ""
                                          }` +
                                          (emojiRegex.test(m?.message.trim())
                                            ? `text-center lg:text-2xl text-xl ${
                                                m?.senderId === user._id
                                                  ? "pe-4"
                                                  : ""
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
                                                <Check
                                                  strokeWidth={3}
                                                  size={12}
                                                />
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
                              <div className="flex flex-col items-center text-gray-500 p-8 rounded-lg">
                                <MessageCircleWarning size={30} />
                                <h1 className="text-sm font-semibold mt-2">
                                  Chat seems empty
                                </h1>
                                <p className="text-xs mt-1">
                                  Start a conversation with{" "}
                                  {selectedDashboard || selectedEmployee?.name}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Input Area - Fixed */}
                      <div className="w-full bg-gray-100 py-2 relative flex-shrink-0 dark:bg-gray-800 dark:border-t dark:border-gray-700">
                        <Smile
                          color={openEmoji ? "#1976D2" : "gray"}
                          size={32}
                          onClick={() => setOpenEmoji(!openEmoji)}
                          className={`absolute top-3 left-2 cursor-pointer active:scale-95 transition-all rounded-full p-1`}
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
                            className="bg-[#1976D2] hover:bg-[#1976D2]/90 transition-all active:scale-95 rounded-full text-white p-2.5"
                          >
                            <SendHorizontal size={20} />
                          </button>
                        </form>
                        {openEmoji && (
                          <div className="absolute bottom-14 left-0 z-50">
                            <MyEmojiPicker onEmojiSelect={handleEmojiSelect} />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <div className="flex flex-col items-center text-gray-500 p-8  rounded-lg">
                        <MessageCircleWarning size={30} />
                        <h1 className="text-sm font-semibold mt-2">
                          No conversation selected
                        </h1>
                        <p className="text-xs mt-1">
                          Please choose an employee to view messages
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotification;
