import { NavLink } from "react-router";
import { MdDashboard } from "react-icons/md";
import { MdOutlineDashboard } from "react-icons/md";
import { RiBox3Fill, RiBox3Line } from "react-icons/ri";
import { FaRegUser, FaUser } from "react-icons/fa6";
import { TbLayoutSidebarLeftCollapse } from "react-icons/tb";
import { TbLayoutSidebarLeftExpand } from "react-icons/tb";
import { IoCartOutline, IoCart } from "react-icons/io5";
import { MdOutlineWarehouse, MdWarehouse } from "react-icons/md";
import { HiMiniUsers, HiOutlineUsers } from "react-icons/hi2";
import { useUser } from "../hooks/useUser";
import { GiGrain } from "react-icons/gi";

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user } = useUser();

  return (
    <div
      className={`${
        isCollapsed
          ? "max-w-16 transition-all duration-500"
          : "max-w-[20rem] transition-all duration-500"
      } border-r border-neutral-100 dark:border-gray-700 dark:bg-gray-900 lg:block hidden`}
    >
      <div className="text-xl flex items-center justify-around font-semibold text-center mt-5">
        {!isCollapsed && (
          <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent line-clamp-1 truncate font-bold">
            <GiGrain className="text-xl text-blue-600" /> Feed manager
          </div>
        )}
        {isCollapsed ? (
          <TbLayoutSidebarLeftExpand
            className="hover:bg-blue-100 transition-all p-2 text-4xl rounded-lg cursor-pointer text-blue-600"
            onClick={() => setIsCollapsed(false)}
          />
        ) : (
          <TbLayoutSidebarLeftCollapse
            className="hover:bg-blue-100 transition-all p-2 text-4xl rounded-lg cursor-pointer text-blue-600"
            onClick={() => setIsCollapsed(true)}
          />
        )}
      </div>

      {user?.role === "Admin" && (
        <div className="mt-10 flex flex-col items-center justify-center m-2 gap-3">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              isActive
                ? "transition-all bg-blue-50 border-e-4 border-blue-500 p-2 w-full text-left rounded-lg"
                : "transition-all hover:bg-blue-50 p-2 w-full text-gray-800 rounded-lg text-left"
            }
          >
            {({ isActive }) => (
              <div className="flex items-center gap-2 font-semibold w-56 h-6">
                <div className="w-6 flex items-center justify-center">
                  {isActive ? (
                    <MdDashboard className="text-blue-600 text-lg" />
                  ) : (
                    <MdOutlineDashboard className="text-blue-600 text-lg" />
                  )}
                </div>
                <span
                  className={`${
                    isCollapsed
                      ? "hidden"
                      : "block line-clamp-1 truncate w-full text-gray-800"
                  }`}
                >
                  Dashboard
                </span>
              </div>
            )}
          </NavLink>

          <NavLink
            to="/admin/product-management"
            className={({ isActive }) =>
              isActive
                ? "transition-all bg-blue-100 border-e-4 border-blue-500 p-2 w-full text-left rounded-lg"
                : "transition-all hover:bg-blue-50 p-2 w-full text-gray-800 rounded-lg text-left"
            }
          >
            {({ isActive }) => (
              <div className="flex items-center gap-2 font-semibold w-56 h-6">
                <div className="w-6 flex items-center justify-center">
                  {isActive ? (
                    <RiBox3Fill className="text-blue-600 text-lg" />
                  ) : (
                    <RiBox3Line className="text-blue-600 text-lg" />
                  )}
                </div>
                <span
                  className={`${
                    isCollapsed
                      ? "hidden"
                      : "block line-clamp-1 truncate w-full text-gray-800"
                  }`}
                >
                  Product Management
                </span>
              </div>
            )}
          </NavLink>

          <NavLink
            to="/admin/employee-management"
            className={({ isActive }) =>
              isActive
                ? "transition-all bg-blue-100 border-e-4 border-blue-500 p-2 w-full text-left rounded-lg"
                : "transition-all hover:bg-blue-50 p-2 w-full text-gray-800 rounded-lg text-left"
            }
          >
            {({ isActive }) => (
              <div className="flex items-center gap-2 font-semibold w-56 h-6">
                <div className="w-6 flex items-center justify-center">
                  {isActive ? (
                    <FaUser className="text-blue-600" />
                  ) : (
                    <FaRegUser className="text-blue-600" />
                  )}
                </div>
                <span
                  className={`${
                    isCollapsed
                      ? "hidden"
                      : "block line-clamp-1 truncate w-full text-gray-800"
                  }`}
                >
                  Employee Management
                </span>
              </div>
            )}
          </NavLink>
          <NavLink
            to="/admin/order-management"
            className={({ isActive }) =>
              isActive
                ? "transition-all bg-blue-100 border-e-4 border-blue-500 p-2 w-full text-left rounded-lg"
                : "transition-all hover:bg-blue-50 p-2 w-full text-gray-800 rounded-lg text-left"
            }
          >
            {({ isActive }) => (
              <div className="flex items-center gap-2 font-semibold w-56 h-6">
                <div className="w-6 flex items-center justify-center">
                  {isActive ? (
                    <IoCart className="text-blue-600 text-xl" />
                  ) : (
                    <IoCartOutline className="text-blue-600 text-xl" />
                  )}
                </div>
                <span
                  className={`${
                    isCollapsed
                      ? "hidden"
                      : "block line-clamp-1 truncate w-full text-gray-800"
                  }`}
                >
                  Order Management
                </span>
              </div>
            )}
          </NavLink>
          <NavLink
            to="/admin/plant-management"
            className={({ isActive }) =>
              isActive
                ? "transition-all bg-blue-100 border-e-4 border-blue-500 p-2 w-full text-left rounded-lg"
                : "transition-all hover:bg-blue-50 p-2 w-full text-gray-800 rounded-lg text-left"
            }
          >
            {({ isActive }) => (
              <div className="flex items-center gap-2 font-semibold w-56 h-6">
                <div className="w-6 flex items-center justify-center">
                  {isActive ? (
                    <MdWarehouse className="text-blue-600 text-lg" />
                  ) : (
                    <MdOutlineWarehouse className="text-blue-600 text-lg" />
                  )}
                </div>
                <span
                  className={`${
                    isCollapsed
                      ? "hidden"
                      : "block line-clamp-1 truncate w-full text-gray-800"
                  }`}
                >
                  Plant Management
                </span>
              </div>
            )}
          </NavLink>
          <NavLink
            to="/admin/party-management"
            className={({ isActive }) =>
              isActive
                ? "transition-all bg-blue-100 border-e-4 border-blue-500 p-2 w-full text-left rounded-lg"
                : "transition-all hover:bg-blue-50 p-2 w-full text-gray-800 rounded-lg text-left"
            }
          >
            {({ isActive }) => (
              <div className="flex items-center gap-2 font-semibold w-56 h-6">
                <div className="w-6 flex items-center justify-center">
                  {isActive ? (
                    <HiMiniUsers className="text-blue-600 text-xl" />
                  ) : (
                    <HiOutlineUsers className="text-blue-600 text-xl" />
                  )}
                </div>
                <span
                  className={`${
                    isCollapsed
                      ? "hidden"
                      : "block line-clamp-1 truncate w-full text-gray-800"
                  }`}
                >
                  Party Management
                </span>
              </div>
            )}
          </NavLink>
        </div>
      )}

      {user?.role === "Salesman" && (
        <div className="mt-10 flex flex-col items-center justify-center m-2 gap-3">
          <NavLink
            to="/salesman/dashboard"
            className={({ isActive }) =>
              isActive
                ? "transition-all bg-blue-100 border-e-4 dark:bg-blue-800 dark:border-blue-200 border-blue-500 p-2 w-full text-left rounded-lg"
                : "transition-all hover:bg-blue-50 dark:hover:bg-blue-700 p-2 w-full dark:text-gray-200 text-gray-800 rounded-lg text-left"
            }
          >
            {({ isActive }) => (
              <div className="flex items-center gap-2 font-semibold w-56 h-6">
                <div className="w-6 flex items-center justify-center">
                  {isActive ? (
                    <IoCart className="text-blue-600 dark:text-gray-300 text-xl" />
                  ) : (
                    <IoCartOutline className="text-blue-600 dark:text-blue-500 text-xl" />
                  )}
                </div>
                <span
                  className={`${
                    isCollapsed
                      ? "hidden"
                      : "block line-clamp-1 truncate w-full text-gray-800 dark:text-gray-300"
                  }`}
                >
                  Order Management
                </span>
              </div>
            )}
          </NavLink>
          <NavLink
            to="/salesman/party-management"
            className={({ isActive }) =>
              isActive
                ? "transition-all bg-blue-100 border-e-4 dark:bg-blue-800 dark:border-blue-200 border-blue-500 p-2 w-full text-left rounded-lg"
                : "transition-all hover:bg-blue-50 dark:hover:bg-blue-700 p-2 w-full dark:text-gray-200 text-gray-800 rounded-lg text-left"
            }
          >
            {({ isActive }) => (
              <div className="flex items-center gap-2 font-semibold w-56 h-6">
                <div className="w-6 flex items-center justify-center">
                  {isActive ? (
                    <HiMiniUsers className="text-blue-600 dark:text-gray-300 text-xl" />
                  ) : (
                    <HiOutlineUsers className="text-blue-600 dark:text-blue-500 text-xl" />
                  )}
                </div>
                <span
                  className={`${
                    isCollapsed
                      ? "hidden"
                      : "block line-clamp-1 truncate w-full text-gray-800 dark:text-gray-300"
                  }`}
                >
                  Party Management
                </span>
              </div>
            )}
          </NavLink>
        </div>
      )}

      {user?.role === "SalesManager" && (
        <div className="mt-10 flex flex-col items-center justify-center m-2 gap-3">
          <NavLink
            to="/salesmanager/dashboard"
            className={({ isActive }) =>
              isActive
                ? "transition-all bg-blue-100 border-e-4 border-blue-500 p-2 w-full text-left rounded-lg"
                : "transition-all hover:bg-blue-50 p-2 w-full text-gray-800 rounded-lg text-left"
            }
          >
            {({ isActive }) => (
              <div className="flex items-center gap-2 font-semibold w-56 h-6">
                <div className="w-6 flex items-center justify-center">
                  {isActive ? (
                    <IoCart className="text-blue-600 text-xl" />
                  ) : (
                    <IoCartOutline className="text-blue-600 text-xl" />
                  )}
                </div>
                <span
                  className={`${
                    isCollapsed
                      ? "hidden"
                      : "block line-clamp-1 truncate w-full text-gray-800"
                  }`}
                >
                  Order Management
                </span>
              </div>
            )}
          </NavLink>
        </div>
      )}

      {user?.role === "SalesAuthorizer" && (
        <div className="mt-10 flex flex-col items-center justify-center m-2 gap-3">
          <NavLink
            to="/salesauthorizer/dashboard"
            className={({ isActive }) =>
              isActive
                ? "transition-all bg-blue-100 border-e-4 border-blue-500 p-2 w-full text-left rounded-lg"
                : "transition-all hover:bg-blue-50 p-2 w-full text-gray-800 rounded-lg text-left"
            }
          >
            {({ isActive }) => (
              <div className="flex items-center gap-2 font-semibold w-56 h-6">
                <div className="w-6 flex items-center justify-center">
                  {isActive ? (
                    <IoCart className="text-blue-600 text-xl" />
                  ) : (
                    <IoCartOutline className="text-blue-600 text-xl" />
                  )}
                </div>
                <span
                  className={`${
                    isCollapsed
                      ? "hidden"
                      : "block line-clamp-1 truncate w-full text-gray-800"
                  }`}
                >
                  Order Management
                </span>
              </div>
            )}
          </NavLink>
        </div>
      )}

      {user?.role === "PlantHead" && (
        <div className="mt-10 flex flex-col items-center justify-center m-2 gap-3">
          <NavLink
            to="/planthead/dashboard"
            className={({ isActive }) =>
              isActive
                ? "transition-all bg-blue-100 border-e-4 border-blue-500 p-2 w-full text-left rounded-lg"
                : "transition-all hover:bg-blue-50 p-2 w-full text-gray-800 rounded-lg text-left"
            }
          >
            {({ isActive }) => (
              <div className="flex items-center gap-2 font-semibold w-56 h-6">
                <div className="w-6 flex items-center justify-center">
                  {isActive ? (
                    <IoCart className="text-blue-600 text-xl" />
                  ) : (
                    <IoCartOutline className="text-blue-600 text-xl" />
                  )}
                </div>
                <span
                  className={`${
                    isCollapsed
                      ? "hidden"
                      : "block line-clamp-1 truncate w-full text-gray-800"
                  }`}
                >
                  Order Management
                </span>
              </div>
            )}
          </NavLink>
          <NavLink
            to="/planthead/product-management"
            className={({ isActive }) =>
              isActive
                ? "transition-all bg-blue-100 border-e-4 border-blue-500 p-2 w-full text-left rounded-lg"
                : "transition-all hover:bg-blue-50 p-2 w-full text-gray-800 rounded-lg text-left"
            }
          >
            {({ isActive }) => (
              <div className="flex items-center gap-2 font-semibold w-56 h-6">
                <div className="w-6 flex items-center justify-center">
                  {isActive ? (
                    <RiBox3Fill className="text-blue-600 text-lg" />
                  ) : (
                    <RiBox3Line className="text-blue-600 text-lg" />
                  )}
                </div>
                <span
                  className={`${
                    isCollapsed
                      ? "hidden"
                      : "block line-clamp-1 truncate w-full text-gray-800"
                  }`}
                >
                  Product Management
                </span>
              </div>
            )}
          </NavLink>
        </div>
      )}

      {user?.role === "Accountant" && (
        <div className="mt-10 flex flex-col items-center justify-center m-2 gap-3">
          <NavLink
            to="/accountant/dashboard"
            className={({ isActive }) =>
              isActive
                ? "transition-all bg-blue-100 border-e-4 border-blue-500 p-2 w-full text-left rounded-lg"
                : "transition-all hover:bg-blue-50 p-2 w-full text-gray-800 rounded-lg text-left"
            }
          >
            {({ isActive }) => (
              <div className="flex items-center gap-2 font-semibold w-56 h-6">
                <div className="w-6 flex items-center justify-center">
                  {isActive ? (
                    <IoCart className="text-blue-600 text-xl" />
                  ) : (
                    <IoCartOutline className="text-blue-600 text-xl" />
                  )}
                </div>
                <span
                  className={`${
                    isCollapsed
                      ? "hidden"
                      : "block line-clamp-1 truncate w-full text-gray-800"
                  }`}
                >
                  Order Management
                </span>
              </div>
            )}
          </NavLink>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
