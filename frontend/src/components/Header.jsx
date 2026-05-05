import { useEffect, useState } from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Button, IconButton, useTheme } from "@mui/material";

import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import Logout from "@mui/icons-material/Logout";
import {
  Box,
  Handshake,
  LayoutDashboard,
  ShoppingBag,
  Users,
  Warehouse,
} from "lucide-react";
import { useUser } from "../hooks/useUser";
import Avatar from "./Avatar";
import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Power,
  PowerOff,
  LogOut,
  Sun,
  Moon,
  Monitor,
  Menu as MenuIcon,
  X,
  Bell,
  MessageCircle,
} from "lucide-react";
import { useTheme as myTheme } from "../context/ThemeContext.jsx";
import Notification from "./Notification.jsx";
import AdminNotification from "./AdminNotification.jsx";
import { useMediaQuery } from "@mui/material";
import { unsubscribeUser } from "../unsubscribeUser";
import useNotification from "../hooks/useNotification.js";
import logo from "../assets/logo6.png";
import { useUnreadChatsContext } from "../context/UnreadChatsContext";
import { useTheme as useThemeContext } from "../context/ThemeContext";
import socket from "../utils/socket";

const Header = ({ isCollapsed, setIsCollapsed }) => {
  const { resolvedTheme } = useThemeContext();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const { changeStatus, user } = useUser();
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));
  const {
    unread,
    unreadForOthers,
    unreadNotifications,
    setUnreadNotifications,
  } = useUnreadChatsContext();
  const totalUnread = Object.values(unread || {}).reduce((a, b) => a + b, 0);
  const totalUnreadForOthers = Object.values(unreadForOthers || {}).reduce(
    (a, b) => a + b,
    0
  );
  const myUnreadNotifications = unreadNotifications?.[user?._id] || 0;

  const { theme: themeContext, setTheme } = myTheme();
  const [isOpenNotification, setIsOpenNotification] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await unsubscribeUser();
    localStorage.removeItem("token");
    navigate("/login");
    toast.error("You are logged out!");
  };

  //fetch notifications
  const { markRead } = useNotification(user._id);

  //mark notification as read
  useEffect(() => {
    if (isOpenNotification) {
      markRead();
      if (user?._id) {
        setUnreadNotifications((prev) => ({ ...(prev || {}), [user._id]: 0 }));
      }
    }
  }, [isOpenNotification]);

  useEffect(() => {
    if (!user?._id) return;

    socket.emit("join", user._id);

    const onNotification = () => {
      if (isOpenNotification) return;
      setUnreadNotifications((prev) => ({
        ...(prev || {}),
        [user._id]: (prev?.[user._id] || 0) + 1,
      }));
    };

    socket.on("notification", onNotification);

    return () => {
      socket.off("notification", onNotification);
    };
  }, [user?._id, isOpenNotification]);

  let items = [];

  switch (user.role) {
    case "Admin":
      items = [
        {
          icon: <LayoutDashboard className="w-4 h-4" />,
          label: "Dashboard",
          href: "/admin/dashboard",
        },
        {
          icon: <Box className="w-4 h-4" />,
          label: "Product Management",
          href: "/admin/product-management",
        },
        {
          icon: <Users className="w-4 h-4" />,
          label: "Employee Management",
          href: "/admin/employee-management",
        },
        {
          icon: <ShoppingBag className="w-4 h-4" />,
          label: "Order Management",
          href: "/admin/order-management",
        },
        {
          icon: <Warehouse className="w-4 h-4" />,
          label: "Plant Management",
          href: "/admin/plant-management",
        },
        {
          icon: <Handshake className="w-4 h-4" />,
          label: "Party Management",
          href: "/admin/party-management",
        },
      ];
      break;
    case "Salesman":
      items = [
        {
          icon: <LayoutDashboard className="w-4 h-4" />,
          label: "Dashboard",
          href: "/salesman/dashboard",
        },
        {
          icon: <Handshake className="w-4 h-4" />,
          label: "Party Management",
          href: "/salesman/party-management",
        },
      ];
      break;
    case "SalesManager":
      items = [
        {
          icon: <LayoutDashboard className="w-4 h-4" />,
          label: "Dashboard",
          href: "/salesmanager/dashboard",
        },
      ];
      break;
    case "SalesAuthorizer":
      items = [
        {
          icon: <LayoutDashboard className="w-4 h-4" />,
          label: "Dashboard",
          href: "/salesauthorizer/dashboard",
        },
      ];
      break;
    case "PlantHead":
      items = [
        {
          icon: <LayoutDashboard className="w-4 h-4" />,
          label: "Dashboard",
          href: "/planthead/dashboard",
        },
        {
          icon: <Box className="w-4 h-4" />,
          label: "Product Management",
          href: "/planthead/product-management",
        },
      ];
      break;
    case "Accountant":
      items = [
        {
          icon: <LayoutDashboard className="w-4 h-4" />,
          label: "Dashboard",
          href: "/accountant/dashboard",
        },
      ];
      break;

    default:
      items = [];
      break;
  }

  return (
    <div className="dark:border-gray-700 h-14 dark:bg-gray-900 transition-all ease-in-out border-b border-neutral-100 z-50">
      <div className="flex lg:justify-end justify-between items-center gap-8 h-full lg:px-10 px-5">
        <div className="hidden lg:block w-full">
          <div className="flex items-center justify-start gap-2 text-[#1976D2] text-xl font-bold">
            <img src={logo} alt="" className="w-7 h-7" />
            <span className="logo">FeedChain</span>
          </div>
        </div>

        <div className="lg:hidden">
          {isCollapsed && (
            <div className="flex items-center gap-5">
              <MenuIcon
                onClick={() => setIsCollapsed(false)}
                className="text-[#1976D2] cursor-pointer active:bg-[#1976D2]/20 rounded-full transition-all p-1.5"
                size={30}
              />
              <div className="flex items-center justify-start gap-2 text-[#1976D2] text- font-bold">
                <img src={logo} alt="" className="w-5 h-5" />
                <span className="logo">Feed manager</span>
              </div>
            </div>
          )}

          {/* Overlay Background */}
          <div
            onClick={() => setIsCollapsed(true)}
            className={`lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
              !isCollapsed ? "opacity-100 visible" : "opacity-0 invisible"
            }`}
          />

          {/* Sidebar for devices except laptop */}
          <div
            className={`lg:hidden md:block fixed top-0 left-0 min-h-full max-h-lvh w-60 p-2 border-r dark:border-gray-700 border-gray-100 bg-white dark:bg-gray-900 overflow-hidden shadow-lg backdrop-blur-sm z-50 flex flex-col items-start justify-between pb-5 transition-transform duration-300 ease-out ${
              !isCollapsed ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="w-full">
              <div className="flex items-center justify-between p-4 w-full">
                <span className="logo text-[#1976D2]">Menu</span>
                <X
                  onClick={() => setIsCollapsed(true)}
                  className="text-[#1976D2] cursor-pointer active:bg-[#1976D2]/20 rounded-full transition-all p-1.5"
                  size={30}
                />
              </div>

              <nav className="flex-1 overflow-y-auto px-2 space-y-2 w-full">
                {items.map((item, index) => (
                  <NavLink
                    key={index}
                    to={item.href}
                    onClick={() => setIsCollapsed(true)}
                    className={({ isActive }) =>
                      isActive
                        ? "group flex items-center w-full text-sm gap-4 p-2 rounded-lg font-semibold text-black dark:text-gray-100 bg-[#1976D2]/20 dark:bg-[#1976D2] transition-colors duration-200 cursor-pointer"
                        : "group flex items-center w-full text-sm gap-4 p-2 rounded-lg font-medium text-gray-500 dark:text-gray-400 hover:bg-[#1976D2]/20 dark:hover:bg-[#1976D2] hover:text-black dark:hover:text-gray-100 transition-colors duration-200 cursor-pointer"
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div
                          className={`flex-shrink-0 ${
                            isActive
                              ? "text-[#1976D2] dark:text-gray-100"
                              : "group-hover:text-[#1976D2] dark:group-hover:text-gray-100 text-gray-500 dark:text-gray-400"
                          } transition-colors`}
                        >
                          {item.icon}
                        </div>
                        <span className="whitespace-nowrap transition-all duration-200 opacity-100 w-auto">
                          {item.label}
                        </span>
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="lg:hidden md:hidden w-full">
              <div className="w-full mb-4 flex gap-2 flex-col items-center justify-center">
                {user?.role !== "Admin" && (
                  <Button
                    fullWidth
                    startIcon={
                      user.isActive ? (
                        <PowerOff size={15} />
                      ) : (
                        <Power size={15} />
                      )
                    }
                    onClick={() => changeStatus(user?.role)}
                    color="black"
                    sx={{
                      textTransform: "none",
                      color: resolvedTheme === "dark" ? "white" : "black",
                      fontSize: isSmDown ? "12px" : "14px",
                      borderRadius: "0px",
                      textAlign: "left",
                      justifyContent: "flex-start",
                      paddingLeft: "1.5rem",
                    }}
                  >
                    {user.isActive ? "Deactivate account" : "Activate account"}
                  </Button>
                )}

                <Button
                  fullWidth
                  startIcon={<LogOut size={15} />}
                  onClick={handleLogout}
                  color="error"
                  sx={{
                    textTransform: "none",
                    borderRadius: "0px",
                    textAlign: "left",
                    justifyContent: "flex-start",
                    paddingLeft: "1.5rem",
                    fontSize: isSmDown ? "12px" : "14px",
                  }}
                >
                  Logout
                </Button>

                <div className="rounded-full p-1 dark:bg-gray-500 items-center bg-gray-200 flex w-fit">
                  <div
                    onClick={() => setTheme("light")}
                    className={`${
                      themeContext === "light"
                        ? "bg-white text-orange-600 transition-all"
                        : "cursor-pointer hover:bg-gray-400 transition-all"
                    } p-1 px-2 rounded-full flex items-center gap-1 `}
                  >
                    <Sun size={12} />
                    <span className="text-[12px]">Light</span>
                  </div>
                  <div
                    onClick={() => setTheme("dark")}
                    className={`${
                      themeContext === "dark"
                        ? "bg-gray-800 text-gray-200 transition-all "
                        : "cursor-pointer hover:bg-gray-400 transition-all"
                    } p-1 px-2 rounded-full flex items-center gap-1`}
                  >
                    <Moon size={12} />
                    <span className="text-[12px]">Dark</span>
                  </div>
                  <div
                    onClick={() => setTheme("system")}
                    className={`${
                      themeContext === "system"
                        ? "bg-gray-800 text-gray-200 transition-all "
                        : "cursor-pointer hover:bg-gray-400 transition-all"
                    } p-1 px-2 rounded-full flex items-center gap-1`}
                  >
                    <Monitor size={12} />
                    <span className="text-[12px]">System</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="px-5 flex items-center gap-3">
                  <Avatar
                    alt={user?.name}
                    src="/static/images/avatar/1.jpg"
                    size={35}
                    name={user?.name}
                    online={user?.isActive}
                  />
                  <div className="flex flex-col">
                    <p className="text-xs dark:text-gray-100">{user?.name}</p>
                    <p className="text-[10px] dark:text-gray-300">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-12">
          <div className="hidden lg:block md:block me-5">
            <p className="dark:text-gray-300 text-sm">{user?.role}</p>
          </div>

          <IconButton
            onClick={() => setIsOpenNotification(!isOpenNotification)}
          >
            <div className="absolute right-9 flex flex-col items-center justify-center gap-1">
              {user.role === "Admin" ? (
                <>
                  {myUnreadNotifications > 0 && (
                    <div className="flex transition-all items-center gap-1 bg-red-600/20 backdrop-blur-sm p-0.5 text-xs text-red-600 font-semibold px-1.5 rounded-full">
                      <Bell size={12} strokeWidth={3} />
                      {myUnreadNotifications > 20
                        ? "20+"
                        : myUnreadNotifications}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {myUnreadNotifications > 0 && (
                    <div className="flex transition-all items-center gap-1 bg-red-600/20 backdrop-blur-sm p-0.5 text-xs text-red-600 font-semibold px-1.5 rounded-full">
                      <Bell size={12} strokeWidth={3} />
                      {myUnreadNotifications > 20
                        ? "20+"
                        : myUnreadNotifications}
                    </div>
                  )}
                </>
              )}
              {user.role === "Admin" ? (
                <>
                  {totalUnread > 0 && (
                    <div className="flex transition-all items-center gap-1 dark:bg-blue-600/90 bg-blue-600/20 backdrop-blur-sm p-0.5 text-xs text-blue-600 dark:text-blue-300 font-semibold px-1.5 rounded-full">
                      <MessageCircle size={12} strokeWidth={3} />
                      {totalUnread > 20 ? "20+" : totalUnread}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {totalUnreadForOthers > 0 && (
                    <div className="flex transition-all items-center gap-1 dark:bg-blue-600/70 bg-blue-600/20 backdrop-blur-sm p-0.5 text-xs text-blue-600 dark:text-blue-300 font-semibold px-1.5 rounded-full">
                      <MessageCircle size={12} strokeWidth={3} />
                      {totalUnreadForOthers > 20 ? "20+" : totalUnreadForOthers}
                    </div>
                  )}
                </>
              )}
            </div>
            <NotificationsIcon className="dark:text-gray-300" />
          </IconButton>

          {isOpenNotification && (
            <>
              {user?.role === "Admin" ? (
                <AdminNotification
                  setIsOpenNotification={setIsOpenNotification}
                />
              ) : (
                <Notification setIsOpenNotification={setIsOpenNotification} />
              )}
            </>
          )}

          <div className="rounded-full p-1 dark:bg-gray-600 items-center bg-gray-200 hidden lg:flex md:flex">
            <div
              onClick={() => setTheme("light")}
              className={`${
                themeContext === "light"
                  ? "bg-white text-orange-600 transition-all"
                  : "cursor-pointer hover:bg-gray-400 text-gray-300 transition-all"
              } p-1.5 rounded-full `}
            >
              <Sun size={14} />
            </div>
            <div
              onClick={() => setTheme("dark")}
              className={`${
                themeContext === "dark"
                  ? "bg-gray-800 text-gray-200 transition-all"
                  : "cursor-pointer hover:bg-gray-400 dark:text-gray-300 transition-all"
              } p-1.5 rounded-full`}
            >
              <Moon size={14} />
            </div>
            <div
              onClick={() => setTheme("system")}
              className={`${
                themeContext === "system"
                  ? "bg-gray-800 text-gray-200 transition-all "
                  : "cursor-pointer hover:bg-gray-400 dark:text-gray-300 transition-all"
              } p-1.5 rounded-full`}
            >
              <Monitor size={14} />
            </div>
          </div>

          <div className="lg:flex md:flex hidden">
            <IconButton
              onClick={handleClick}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={open ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
            >
              <Avatar
                alt={user?.name}
                src="/static/images/avatar/1.jpg"
                size={40}
                name={user?.name}
                online={user?.isActive}
              />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={open}
              onClose={handleClose}
              onClick={handleClose}
              slotProps={{
                paper: {
                  elevation: 0,
                  sx: {
                    overflow: "visible",
                    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                    mt: 1.5,
                    "& .MuiAvatar-root": {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                    "&::before": {
                      content: '""',
                      display: "block",
                      position: "absolute",
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: "background.paper",
                      transform: "translateY(-50%) rotate(45deg)",
                      zIndex: 0,
                    },
                  },
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem>
                <div className="flex items-center gap-2">
                  <Avatar
                    alt={user?.name}
                    src="/static/images/avatar/1.jpg"
                    size={40}
                    name={user?.name}
                    online={user?.isActive}
                  />
                  <div className="flex flex-col">
                    <p className="text-sm">{user?.name}</p>
                    <p className="text-xs">{user?.email}</p>
                  </div>
                </div>
              </MenuItem>
              <Divider />
              {user?.role !== "Admin" && (
                <div>
                  {user?.isActive ? (
                    <MenuItem onClick={() => changeStatus(user.role)}>
                      <ListItemIcon>
                        <PowerOff size={18} />
                      </ListItemIcon>
                      Deactivate Account
                    </MenuItem>
                  ) : (
                    <MenuItem onClick={() => changeStatus(user.role)}>
                      <ListItemIcon>
                        <Power size={18} />
                      </ListItemIcon>
                      Activate Account
                    </MenuItem>
                  )}
                </div>
              )}
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
