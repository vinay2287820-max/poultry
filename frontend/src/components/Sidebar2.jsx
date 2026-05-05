import { useState } from "react";
import { NavLink } from "react-router";
import {
  Box,
  Handshake,
  LayoutDashboard,
  ShoppingBag,
  Users,
  Warehouse,
} from "lucide-react";
import { useUser } from "../hooks/useUser";

function Sidebar2() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  let items = [];

  switch (user.role) {
    case "Admin":
      items = [
        {
          icon: <LayoutDashboard className="w-5 h-5" />,
          label: "Dashboard",
          href: "/admin/dashboard",
        },
        {
          icon: <Box className="w-5 h-5" />,
          label: "Product Management",
          href: "/admin/product-management",
        },
        {
          icon: <Users className="w-5 h-5" />,
          label: "Employee Management",
          href: "/admin/employee-management",
        },
        {
          icon: <ShoppingBag className="w-5 h-5" />,
          label: "Order Management",
          href: "/admin/order-management",
        },
        {
          icon: <Warehouse className="w-5 h-5" />,
          label: "Plant Management",
          href: "/admin/plant-management",
        },
        {
          icon: <Handshake className="w-5 h-5" />,
          label: "Party Management",
          href: "/admin/party-management",
        },
      ];
      break;

    case "Salesman":
      items = [
        {
          icon: <LayoutDashboard className="w-5 h-5" />,
          label: "Dashboard",
          href: "/salesman/dashboard",
        },
        {
          icon: <Handshake className="w-5 h-5" />,
          label: "Party Management",
          href: "/salesman/party-management",
        },
      ];
      break;

    case "SalesManager":
      items = [
        {
          icon: <LayoutDashboard className="w-5 h-5" />,
          label: "Dashboard",
          href: "/salesmanager/dashboard",
        },
      ];
      break;

    case "SalesAuthorizer":
      items = [
        {
          icon: <LayoutDashboard className="w-5 h-5" />,
          label: "Dashboard",
          href: "/salesauthorizer/dashboard",
        },
      ];
      break;

    case "PlantHead":
      items = [
        {
          icon: <LayoutDashboard className="w-5 h-5" />,
          label: "Dashboard",
          href: "/planthead/dashboard",
        },
        {
          icon: <Box className="w-5 h-5" />,
          label: "Product Management",
          href: "/planthead/product-management",
        },
      ];
      break;

    case "Accountant":
      items = [
        {
          icon: <LayoutDashboard className="w-5 h-5" />,
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
    <div
      className="fixed left-0 top-14 h-full z-40 border-r dark:border-gray-700 border-gray-100 lg:block hidden"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Sidebar container */}
      <div
        className={`h-full bg-white dark:bg-gray-900 transition-all ease-out overflow-hidden flex flex-col ${
          isOpen ? "w-64 shadow-xl" : "w-14"
        }`}
      >
        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto py-6 px-2 space-y-2">
          {items.map((item, index) => (
            <NavLink
              key={index}
              to={item.href}
              className={({ isActive }) =>
                isActive
                  ? "group flex items-center gap-4 p-2 rounded-lg font-semibold text-black dark:text-gray-100 bg-[#1976D2]/20 dark:bg-[#1976D2] transition-colors duration-200 cursor-pointer"
                  : "group flex items-center gap-4 p-2 rounded-lg font-medium text-gray-500 dark:text-gray-400 hover:bg-[#1976D2]/20 dark:hover:bg-[#1976D2] hover:text-black dark:hover:text-gray-100 transition-colors duration-200 cursor-pointer"
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
                  <span
                    className={`whitespace-nowrap transition-all duration-200 ${
                      isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
                    }`}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

export default Sidebar2;
