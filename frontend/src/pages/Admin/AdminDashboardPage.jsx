import React from "react";
import TotalSales from "../../components/Admin/AdminDashboard/TotalSales";
import TotalOrders from "../../components/Admin/AdminDashboard/TotalOrders";
import TotalEmployees from "../../components/Admin/AdminDashboard/TotalEmployees";
import DueAmount from "../../components/Admin/AdminDashboard/DueAmount";
import AdvancedCollected from "../../components/Admin/AdminDashboard/AdvancedCollected";
import WeeklySales from "../../components/Admin/AdminDashboard/WeeklySales";
import AdvanceVsDue from "../../components/Admin/AdminDashboard/AdvanceVsDue";
import RateChart from "../../components/Admin/AdminDashboard/RateChart";
import ActiveEmployees from "../../components/Admin/AdminDashboard/ActiveEmployees";
import TopSalesman from "../../components/Admin/AdminDashboard/TopSalesman";
import { useAdminOrder } from "../../hooks/useAdminOrders.js";
import useEmployees from "../../hooks/useEmployees.js";
import { CircularProgress } from "@mui/material";

const AdminDashboardPage = () => {
  const { orders, ordersLoading } = useAdminOrder();
  const {
    salesman,
    salesmanager,
    salesauthorizer,
    planthead,
    accountant,
    isLoading,
  } = useEmployees();

  const total = orders?.reduce((sum, order) => {
    if (order?.orderStatus !== "Cancelled") {
      return sum + order?.totalAmount;
    }
    return sum;
  }, 0);

  const advance = orders?.reduce((sum, order) => {
    if (order?.orderStatus !== "Cancelled") {
      return sum + order?.advanceAmount;
    }
    return sum;
  }, 0);

  const due = orders?.reduce((sum, order) => {
    if (order?.orderStatus !== "Cancelled") {
      return sum + order?.dueAmount;
    }
    return sum;
  }, 0);
  const totalOrders = orders?.length;
  const totalEmployees =
    salesman?.length +
    salesmanager?.length +
    salesauthorizer?.length +
    planthead?.length +
    accountant?.length;

  const totalActiveEmployees =
    salesman?.filter((item) => item.isActive === true)?.length +
    salesmanager?.filter((item) => item.isActive === true)?.length +
    salesauthorizer?.filter((item) => item.isActive === true)?.length +
    planthead?.filter((item) => item.isActive === true)?.length +
    accountant?.filter((item) => item.isActive === true)?.length;

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <div>
      <h1 className="lg:text-3xl md:text-xl font-bold lg:mb-5 md:mb-5 sm:mb-5 mb-2 sm:text-lg text-base dark:text-gray-200">
        Dashboard
      </h1>
      <div className="grid lg:grid-cols-3 grid-cols-1 gap-3 md:grid-cols-2 sm:grid-cols-2 lg:gap-7 md:gap-3 lg:mt-3">
        <TotalSales total={total} ordersLoading={ordersLoading} />
        <AdvancedCollected advance={advance} ordersLoading={ordersLoading} />
        <TotalOrders totalOrders={totalOrders} ordersLoading={ordersLoading} />
        <TotalEmployees
          totalEmployees={totalEmployees}
          ordersLoading={isLoading}
        />
        <ActiveEmployees
          totalActiveEmployees={totalActiveEmployees}
          ordersLoading={isLoading}
        />
        <DueAmount due={due} ordersLoading={ordersLoading} />
      </div>
      <div className="mb-5 mt-7 grid lg:grid-cols-2 gap-5">
        <WeeklySales />
        <AdvanceVsDue />
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <RateChart />
        <TopSalesman />
      </div>
    </div>
  );
};

export default AdminDashboardPage;
