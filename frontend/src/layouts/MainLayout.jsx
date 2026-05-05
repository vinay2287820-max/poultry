import { useState } from "react";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";
import Sidebar2 from "../components/Sidebar2";
import { useUser } from "../hooks/useUser";
import AdminSocketManager from "../components/AdminSocketManager";
import SocketManager from "../components/SocketManager";

const MainLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { user } = useUser();

  return (
    <div className="flex relative">
      {/* <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /> */}

      <div
        className={`flex flex-col h-screen transition-all duration-300 ${
          isCollapsed
            ? "w-full"
            : "lg:w-[calc(100%-250px)] md:w-full sm:w-full w-full"
        }`}
      >
        <div className="h-14">
          <Header isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
          {user.role === "Admin" ? <AdminSocketManager /> : <SocketManager />}
        </div>
        <div className="lg:ps-20 lg:py-5 md:p-5 sm:p-5 p-2 overflow-y-auto flex-1 md:w-full bg-gray-50 dark:bg-gray-950">
          <Sidebar2 isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
