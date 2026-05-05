import React, { useState } from "react";
import OrdersForPlantHead from "../../components/Planthead/OrdersForPlantHead";
import { Button, ButtonGroup, useMediaQuery, useTheme } from "@mui/material";
import DispatchedOrders from "../../components/Planthead/DispatchedOrders";

const PlantheadDashboardPage = () => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));

  const orderTypes = ["All Orders", "Dispatched Orders"];
  const [isActive, setIsActive] = useState("All Orders");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="lg:text-3xl md:text-2xl font-bold lg:mb-5 md:mb-5 sm:mb-5 mb-2 sm:text-lg text-base dark:text-gray-200">
          {isActive}
        </h1>
      </div>

      <div className="mb-5">
        <ButtonGroup aria-label="Medium-sized button group">
          {orderTypes.map((order) => (
            <Button
              key={order._id}
              disableElevation
              variant={isActive === order ? "contained" : "outlined"}
              sx={{
                textTransform: "none",
              }}
              size={isMdUp ? "medium" : "small"}
              onClick={() => setIsActive(order)}
            >
              {order}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      <div>
        {isActive === "All Orders" && <OrdersForPlantHead />}
        {isActive === "Dispatched Orders" && <DispatchedOrders />}
      </div>
    </div>
  );
};

export default PlantheadDashboardPage;
