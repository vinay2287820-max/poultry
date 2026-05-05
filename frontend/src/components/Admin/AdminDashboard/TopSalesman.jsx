import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAdminOrder } from "../../../hooks/useAdminOrders";
import useEmployees from "../../../hooks/useEmployees";
import { CircularProgress } from "@mui/material";

const TopSalesman = () => {
  const { orders, ordersLoading } = useAdminOrder();
  const { salesman, salesmanLoading } = useEmployees();

  // Function to compute TOTAL SALES per salesman
  const getTopSalesmanData = (orders, salesmenList) => {
    const salesMap = {};

    // Step 1: Initialize every salesman with 0 sales
    salesmenList.forEach((s) => {
      salesMap[s._id] = { name: s.name, sales: 0 };
    });

    // Step 2: Add sales from orders
    orders.forEach((order) => {
      // Handle all 3 formats of placedBy
      const salesmanId =
        order.placedBy?._id ||
        order.placedBy?.$oid ||
        order.placedBy ||
        null;

      // Only count if ID matches an existing salesman
      if (salesmanId && salesMap[salesmanId]) {
        salesMap[salesmanId].sales += order.totalAmount || 0;
      }
    });

    // Step 3: Convert map → array + sort by highest sales
    return Object.values(salesMap).sort((a, b) => b.sales - a.sales);
  };

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (orders?.length > 0 && salesman?.length > 0) {
      const formatted = getTopSalesmanData(orders, salesman);
      setChartData(formatted);
    }
  }, [orders, salesman]);

  if (ordersLoading || salesmanLoading) return <CircularProgress />;

  return (
    <div className="rounded-lg lg:p-5 md:p-5 sm:p-5 p-3 bg-white dark:bg-gray-900 shadow hover:shadow-md transition-all">
      <h1 className="lg:text-xl md:text-xl text-sm font-semibold mb-4 dark:text-gray-300">
        Top Salesman Performance
      </h1>

      <div
        className="flex flex-col items-center justify-center w-full h-52 sm:h-52 md:h-80 lg:h-80"
        tabIndex={-1}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="sales" fill="#4CAF50" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TopSalesman;
