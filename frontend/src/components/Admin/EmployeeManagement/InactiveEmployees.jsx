import React from "react";
import { FaUserCheck } from "react-icons/fa6";

const InactiveEmployees = ({ total }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg md:p-3 sm:p-3 lg:p-5 p-3 flex items-center justify-between gap-5 shadow hover:shadow-md transition-all">
      <div className="flex flex-col">
        <p className="text-left font-semibold lg:text-base md:text-sm sm:text-sm text-sm text-gray-600 dark:text-gray-300">
          Inactive{" "}
          <span className="md:hidden sm:hidden lg:inline-block">Employees</span>
        </p>
        <p className="lg:text-3xl md:text-2xl sm:text-2xl text-xl text-left font-semibold dark:text-gray-200">
          {total}
        </p>
      </div>
      <div className="p-3 bg-red-100 dark:bg-red-800 rounded-full">
        <FaUserCheck className="lg:text-4xl md:text-2xl text-2xl sm:text-xl opacity-70 text-red-600 dark:text-red-100" />
      </div>
    </div>
  );
};

export default InactiveEmployees;
