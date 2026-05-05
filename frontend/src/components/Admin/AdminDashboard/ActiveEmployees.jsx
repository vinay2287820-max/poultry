import { CircularProgress } from "@mui/material";
import React from "react";
import { FiUserCheck } from "react-icons/fi";

const ActiveEmployees = ({ totalActiveEmployees, ordersLoading }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg lg:p-4 md:p-3 sm:p-4 p-3 flex items-center justify-between gap-5 shadow hover:shadow-md transition-all">
      <div className="flex flex-col justify-center gap-1 h-full">
        <p className="dark:text-gray-300 text-left text-sm lg:text-base md:text-base sm:text-base font-semibold text-gray-600">
          Active Employees
        </p>
        {ordersLoading ? (
          <div className="m-3">
            <CircularProgress size={20} />
          </div>
        ) : (
          <div>
            <p className="dark:text-gray-200 lg:text-4xl md:text-2xl sm:text-2xl text-2xl text-left font-semibold">
              {totalActiveEmployees}
            </p>
          </div>
        )}
      </div>
      <div className="p-3 bg-violet-100 dark:bg-violet-800 rounded-full">
        <FiUserCheck className="lg:text-4xl md:text-3xl sm:text-3xl text-2xl opacity-70 text-violet-600 dark:text-violet-200" />
      </div>
    </div>
  );
};

export default ActiveEmployees;
