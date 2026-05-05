import React from "react";
import OrdersTable from "../../components/Admin/OrderManagement/OrdersTable";

const OrderManagementPage = () => {
  return (
    <div>
      <h1 className="lg:text-3xl md:text-xl font-bold dark:text-gray-200">
        Order Management
      </h1>
      <OrdersTable />
    </div>
  );
};

export default OrderManagementPage;
