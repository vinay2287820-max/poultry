import React, { useState } from "react";
import OrdersForManager from "../../components/SalesManager/OrderManagementForSalesManager/OrdersForManager";
import ForwardedOrders from "../../components/SalesManager/OrderManagementForSalesManager/ForwardedOrders";
import { Button, ButtonGroup, useMediaQuery, useTheme } from "@mui/material";

const SalesManagerDashboardPage = () => {
  const orderTypes = ["All Orders", "Forwarded Orders"];
  const [isActive, setIsActive] = useState("All Orders");
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="lg:text-3xl text-lg font-bold lg:mb-5 mb-3">
          {isActive}
        </h1>
      </div>

      <div className="lg:mb-5 mb-3">
        <ButtonGroup aria-label="Medium-sized button group">
          {orderTypes.map((order) => (
            <Button
              key={order._id}
              disableElevation
              size={isMdUp ? "medium" : "small"}
              variant={isActive === order ? "contained" : "outlined"}
              sx={{
                textTransform: "none",
              }}
              onClick={() => setIsActive(order)}
            >
              {order}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      <div className="my-5">
        {isActive === "All Orders" && <OrdersForManager />}
        {isActive === "Forwarded Orders" && <ForwardedOrders />}
      </div>
    </div>
  );
};

export default SalesManagerDashboardPage;
