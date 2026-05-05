import { createContext, useContext } from "react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const sendNotification = async (data) => {
    try {
      const permission = await Notification.requestPermission();
      console.log("Notification permission:", permission);

      if (permission === "granted") {
        new Notification(data.senderName || "New Message", {
          body: data.message || "You have a new notification",
        });
      } else {
        console.warn("Notification permission not granted!");
      }
    } catch (error) {
      console.error("Error showing notification:", error);
    }
  };

  return (
    <NotificationContext.Provider value={{ sendNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => useContext(NotificationContext);
