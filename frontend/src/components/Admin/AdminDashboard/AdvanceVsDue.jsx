import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useAdminOrder } from "../../../hooks/useAdminOrders";
import { CircularProgress } from "@mui/material";

const AdvanceVsDue = () => {
  const { orders, ordersLoading } = useAdminOrder();
  // Helper: find week number of month
  const getWeekOfMonth = (date) => {
    const day = date.getDate();
    return Math.ceil(day / 7); // week 1–4 (sometimes 5)
  };

  const getAdvanceVsDueData = (orders) => {
    const weekData = {
      1: { advance: 0, due: 0 },
      2: { advance: 0, due: 0 },
      3: { advance: 0, due: 0 },
      4: { advance: 0, due: 0 },
    };

    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt?.$date || order.createdAt);

      const week = getWeekOfMonth(orderDate);
      if (week > 4) return; // Ignore week 5 to keep chart consistent

      weekData[week].advance += order.advanceAmount || 0;
      weekData[week].due += order.dueAmount || 0;
    });

    // convert to recharts format
    return [
      { name: "Week 1", advance: weekData[1].advance, due: weekData[1].due },
      { name: "Week 2", advance: weekData[2].advance, due: weekData[2].due },
      { name: "Week 3", advance: weekData[3].advance, due: weekData[3].due },
      { name: "Week 4", advance: weekData[4].advance, due: weekData[4].due },
    ];
  };

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (orders?.length > 0) {
      const formatted = getAdvanceVsDueData(orders);
      setChartData(formatted);
    }
  }, [orders]);

  if (ordersLoading) return <CircularProgress />;

  return (
    <div className="rounded-lg lg:p-5 md:p-5 sm:p-5 p-3 bg-white dark:bg-gray-900 shadow hover:shadow-md transition-all w-full">
      <h1 className="lg:text-xl md:text-xl text-sm font-semibold mb-4 dark:text-gray-300">
        Advance vs Due
      </h1>
      <div
        className="flex flex-col items-center justify-center w-full h-52 md:h-80 sm:h-52 sm:w-full md:w-full lg:w-full lg:h-80"
        tabIndex={-1}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart width="100%" height="100%" data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="advance" fill="#4CAF50" />
            <Bar dataKey="due" fill="#F44336" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdvanceVsDue;
