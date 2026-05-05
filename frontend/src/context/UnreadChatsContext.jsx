import { createContext, useContext, useState } from "react";

const UnreadChatsContext = createContext();

export const UnreadChatsProvider = ({ children }) => {
  const [unread, setUnread] = useState({});
  const [unreadNotifications, setUnreadNotifications] = useState({});

  const [unreadForOthers, setUnreadForOthers] = useState({});
  const [unreadNotificationsForOthers, setUnreadNotificationsForOthers] =
    useState({});

  return (
    <UnreadChatsContext.Provider
      value={{
        unread,
        unreadForOthers,
        unreadNotifications,
        unreadNotificationsForOthers,
        setUnread,
        setUnreadForOthers,
        setUnreadNotifications,
        setUnreadNotificationsForOthers,
      }}
    >
      {children}
    </UnreadChatsContext.Provider>
  );
};

export const useUnreadChatsContext = () => useContext(UnreadChatsContext);
