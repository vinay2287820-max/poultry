import { LuUsers } from "react-icons/lu";

const TotalEmployees = ({ total }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg md:p-3 lg:p-5 sm:p-3 p-3 flex items-center justify-between gap-5 shadow hover:shadow-md transition-all">
      <div className="flex flex-col">
        <p className="text-left font-semibold lg:text-base md:text-sm sm:text-sm text-sm text-gray-600 dark:text-gray-300">
          Total{" "}
          <span className="md:hidden sm:hidden lg:inline-block">Employees</span>
        </p>
        <p className="lg:text-3xl md:text-2xl sm:text-2xl text-xl text-left font-semibold dark:text-gray-200">
          {total}
        </p>
      </div>
      <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-full">
        <LuUsers className="lg:text-4xl md:text-2xl sm:text-xl text-2xl opacity-70 text-blue-600 dark:text-blue-100" />
      </div>
    </div>
  );
};

export default TotalEmployees;
