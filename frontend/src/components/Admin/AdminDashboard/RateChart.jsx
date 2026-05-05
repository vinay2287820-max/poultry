import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useAdminOrder } from "../../../hooks/useAdminOrders";
import { CircularProgress } from "@mui/material";

const RateChart = () => {
  const { orders, ordersLoading } = useAdminOrder();

  const getRateChartData = (orders) => {
    return orders.map((order) => {
      const dateObj = new Date(order.createdAt?.$date || order.createdAt);

      const day = dateObj.getDate().toString().padStart(2, "0");
      const month = dateObj.toLocaleString("default", { month: "short" });

      return {
        date: `${day} ${month}`, // e.g. "24 Nov"
        rate: order.totalAmount || 0,
      };
    });
  };

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (orders?.length > 0) {
      const formatted = getRateChartData(orders);
      setChartData(formatted);
    }
  }, [orders]);

  if (ordersLoading) return <CircularProgress />;
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg lg:p-5 md:p-5 sm:p-5 p-3 shadow hover:shadow-md transition-all">
      <h1 className="lg:text-xl md:text-xl text-sm font-semibold mb-4 dark:text-gray-300">
        Rate Chart
      </h1>
      <div
        className="flex flex-col items-center justify-center w-full h-52 md:h-80 sm:h-52 sm:w-full md md:w-full lg:w-full lg:h-80"
        tabIndex={-1}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="rate"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#colorRate)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RateChart;
