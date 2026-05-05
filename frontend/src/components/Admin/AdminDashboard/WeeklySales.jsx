import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useAdminOrder } from "../../../hooks/useAdminOrders";
import { CircularProgress } from "@mui/material";

const WeeklySales = () => {
  const { orders, ordersLoading } = useAdminOrder();
  const getWeeklySalesData = (orders) => {
    // starting template (Monday to Sunday)
    const weekTemplate = {
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
      Sun: 0,
    };

    orders.forEach((order) => {
      const date = new Date(order.createdAt?.$date || order.createdAt);
      const dayIndex = date.getDay(); // 0 = Sun, 1 = Mon ...

      const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const day = dayMap[dayIndex];

      // Add totalAmount to correct day
      weekTemplate[day] += order.totalAmount;
    });

    // convert object → array for Recharts:
    return Object.keys(weekTemplate).map((day) => ({
      day,
      sales: weekTemplate[day],
    }));
  };

  const [weeklyData, setWeeklyData] = useState([]);

  useEffect(() => {
    if (orders && orders.length > 0) {
      const chartData = getWeeklySalesData(orders);
      setWeeklyData(chartData);
    }
  }, [orders]);

  if (ordersLoading) return <CircularProgress />;

  return (
    <div className="rounded-lg lg:p-5 md:p-5 sm:p-5 p-3 bg-white dark:bg-gray-900 shadow hover:shadow-md transition-all w-full">
      <h1 className="lg:text-xl md:text-xl text-sm font-semibold mb-4 dark:text-gray-300">
        Weekly Sales
      </h1>
      <div
        className="flex flex-col items-center justify-center w-full h-52 sm:h-52 sm:w-full md:h-80 md:w-full lg:w-full lg:h-80"
        tabIndex={-1}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={weeklyData}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklySales;
