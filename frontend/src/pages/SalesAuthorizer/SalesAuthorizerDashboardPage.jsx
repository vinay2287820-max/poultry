import React, { useState } from "react";
import OrdersForAuthorizer from "../../components/SalesAuthorizer/OrderManagementForSalesAuthorizer/OrdersForAuthorizer";
import AssignmentHistory from "../../components/SalesAuthorizer/OrderManagementForSalesAuthorizer/AssignmentHistory";
import { Button, ButtonGroup, useMediaQuery, useTheme } from "@mui/material";

const SalesAuthorizerDashboardPage = () => {
  const orderTypes = ["All Orders", "Assignment History"];
  const [isActive, setIsActive] = useState("All Orders");

  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="lg:text-3xl md:text-2xl font-bold lg:mb-5 md:mb-5 sm:mb-5 mb-2 sm:text-lg text-base dark:text-gray-200">
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

      <div>
        {isActive === "All Orders" && <OrdersForAuthorizer />}
        {isActive === "Assignment History" && <AssignmentHistory />}
      </div>
    </div>
  );
};

export default SalesAuthorizerDashboardPage;
